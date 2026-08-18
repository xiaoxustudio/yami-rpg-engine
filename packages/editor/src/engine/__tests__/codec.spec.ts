import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.mock('@app/engine/webgl/webgl-init.ts', () => ({
	GL: {
		arrays: {
			0: {
				uint8: new Uint8Array(65536)
			}
		}
	}
}));

vi.mock('@app/legacy/scene/scene-window.ts', () => ({
	Scene: {
		createTiles: (width: number, height: number) => {
			const tiles = new Uint32Array(width * height);
			(tiles as any).width = width;
			(tiles as any).height = height;
			(tiles as any).rowOffset = width;
			return tiles;
		},
		createTerrains: (width: number, height: number) => {
			const terrains = new Uint8Array(width * height);
			(terrains as any).rowOffset = width;
			return terrains;
		}
	}
}));

import { Codec } from '@app/engine/codec/codec.ts';
import { GL } from '@app/engine/webgl/webgl-init.ts';

describe('Codec.encodeFile', () => {
	beforeEach(() => {
		(GL as any).arrays[0].uint8.fill(0);
	});

	it('对前 16 字节加 0x80', () => {
		const input = new Uint8Array(32);
		for (let i = 0; i < 32; i++) input[i] = i;
		const result = Codec.encodeFile!(input);
		for (let i = 0; i < 0x10; i++) {
			expect(result[i]).toBe(i + 0x80);
		}
		for (let i = 0x10; i < 32; i++) {
			expect(result[i]).toBe(i);
		}
	});

	it('字符串输入先 UTF-8 编码再加 0x80', () => {
		const result = Codec.encodeFile!('AB');
		expect(result[0]).toBe(0x41 + 0x80);
		expect(result[1]).toBe(0x42 + 0x80);
	});
});

describe('Codec.encodeClone / decodeClone', () => {
	beforeEach(() => {
		(GL as any).arrays[0].uint8.fill(0);
	});

	it('小数值（1-31）单字节编解码往返', () => {
		const buf = new Uint8Array(256);
		for (const count of [1, 15, 31]) {
			const end = Codec.encodeClone!(buf, 10, count);
			const result = Codec.decodeClone!(buf, 10);
			expect(result.count).toBe(count);
			expect(result.index).toBe(end);
		}
	});

	it('中等数值（32-1023）双字节编解码往返', () => {
		const buf = new Uint8Array(256);
		const count = 500;
		const end = Codec.encodeClone!(buf, 0, count);
		const result = Codec.decodeClone!(buf, 0);
		expect(result.count).toBe(count);
		expect(result.index).toBe(end);
	});

	it('大数值（>1023）多字节编解码往返', () => {
		const buf = new Uint8Array(256);
		const count = 10000;
		const end = Codec.encodeClone!(buf, 0, count);
		const result = Codec.decodeClone!(buf, 0);
		expect(result.count).toBe(count);
		expect(result.index).toBe(end);
	});

	it('最大测试值编解码往返', () => {
		const buf = new Uint8Array(256);
		const count = 65535;
		const end = Codec.encodeClone!(buf, 0, count);
		const result = Codec.decodeClone!(buf, 0);
		expect(result.count).toBe(count);
		expect(result.index).toBe(end);
	});
});

describe('Codec.encodeTiles / decodeTiles', () => {
	beforeEach(() => {
		(GL as any).arrays[0].uint8.fill(0);
	});

	it('全零 tiles 解码后仍为全零', () => {
		const width = 4;
		const height = 4;
		const emptyTiles = new Uint32Array(width * height);
		const code = Codec.encodeTiles!(emptyTiles);
		const decoded = Codec.decodeTiles!(code, width, height);
		expect(decoded.length).toBe(width * height);
		expect(Array.from(decoded)).toEqual(new Array(width * height).fill(0));
	});

	it('单个非零 tile 编解码往返', () => {
		const width = 1;
		const height = 1;
		const tiles = new Uint32Array([0x01020304]);
		const code = Codec.encodeTiles!(tiles);
		const decoded = Codec.decodeTiles!(code, width, height);
		expect(decoded[0]).toBe(0x01020304);
	});

	it('连续相同 tile 编解码往返', () => {
		const width = 12;
		const height = 1;
		const value = 0x3f3f3f3f;
		const tiles = new Uint32Array(width).fill(value);
		const code = Codec.encodeTiles!(tiles);
		const decoded = Codec.decodeTiles!(code, width, height);
		expect(Array.from(decoded)).toEqual(new Array(width).fill(value));
	});

	it('混合零与非零 tile 编解码往返', () => {
		const width = 6;
		const height = 1;
		const tiles = new Uint32Array([0x01020304, 0, 0, 0x05060708, 0, 0x090a0b0c]);
		const code = Codec.encodeTiles!(tiles);
		const decoded = Codec.decodeTiles!(code, width, height);
		expect(Array.from(decoded)).toEqual(Array.from(tiles));
	});
});

describe('Codec.encodeTerrains / decodeTerrains', () => {
	beforeEach(() => {
		(GL as any).arrays[0].uint8.fill(0);
	});

	it('全零 terrains 解码后仍为全零', () => {
		const width = 5;
		const height = 5;
		const empty = new Uint8Array(width * height);
		const code = Codec.encodeTerrains!(empty);
		const decoded = Codec.decodeTerrains!(code, width, height);
		expect(decoded.length).toBe(width * height);
		expect(Array.from(decoded)).toEqual(new Array(width * height).fill(0));
	});

	it('单个非零 terrain 编解码往返', () => {
		const width = 1;
		const height = 1;
		const terrains = new Uint8Array([3]);
		const code = Codec.encodeTerrains!(terrains);
		const decoded = Codec.decodeTerrains!(code, width, height);
		expect(decoded[0]).toBe(3);
	});

	it('连续相同 terrain 编解码往返', () => {
		const width = 30;
		const height = 1;
		const terrains = new Uint8Array(width).fill(5);
		const code = Codec.encodeTerrains!(terrains);
		const decoded = Codec.decodeTerrains!(code, width, height);
		expect(Array.from(decoded)).toEqual(new Array(width).fill(5));
	});

	it('混合地形值编解码往返', () => {
		const width = 10;
		const height = 1;
		const terrains = new Uint8Array([1, 2, 0, 0, 0, 3, 3, 3, 4, 0]);
		const code = Codec.encodeTerrains!(terrains);
		const decoded = Codec.decodeTerrains!(code, width, height);
		expect(Array.from(decoded)).toEqual(Array.from(terrains));
	});
});

describe('Codec.encodeTeamData / decodeTeamData', () => {
	beforeEach(() => {
		(GL as any).arrays[0].uint8.fill(0);
	});

	it('全零 team data 编解码往返', () => {
		const length = 6;
		const dataLength = ((length + 1) / 2) * length;
		const data = new Uint8Array(dataLength);
		const code = Codec.encodeTeamData!(data);
		const decoded = Codec.decodeTeamData!(code, length);
		expect(decoded.length).toBe(dataLength);
		expect(Array.from(decoded)).toEqual(Array.from(data));
	});

	it('含非零值 team data 编解码往返', () => {
		const length = 6;
		const dataLength = ((length + 1) / 2) * length;
		const data = new Uint8Array(dataLength);
		data[0] = 1;
		data[5] = 1;
		data[10] = 1;
		const code = Codec.encodeTeamData!(data);
		const decoded = Codec.decodeTeamData!(code, length);
		expect(decoded.length).toBe(dataLength);
		expect(Array.from(decoded)).toEqual(Array.from(data));
	});
});

describe('Codec.getTilemaps', () => {
	it('从 scene objects 提取 tilemap', () => {
		const scene = {
			objects: [
				{ class: 'folder', children: [{ class: 'tilemap', code: 'a' }] },
				{ class: 'actor' }
			]
		} as any;
		const result = Codec.getTilemaps!(scene);
		expect(result.length).toBe(1);
		expect(result[0].class).toBe('tilemap');
	});

	it('无 tilemap 时返回空数组', () => {
		const scene = {
			objects: [{ class: 'actor' }, { class: 'folder', children: [] }]
		} as any;
		const result = Codec.getTilemaps!(scene);
		expect(result.length).toBe(0);
	});

	it('递归提取嵌套 folder 中的 tilemap', () => {
		const scene = {
			objects: [
				{
					class: 'folder',
					children: [
						{
							class: 'folder',
							children: [{ class: 'tilemap', code: 'b' }]
						}
					]
				}
			]
		} as any;
		const result = Codec.getTilemaps!(scene);
		expect(result.length).toBe(1);
	});
});
