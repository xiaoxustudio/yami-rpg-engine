import { describe, expect, it, afterAll, beforeAll } from 'vitest';
import { Palette } from '@app/palette/palette.ts';
import '@app/palette/register.ts';
import { paletteEls } from '@app/palette/element-registry.ts';
import { inspectorEls } from '@app/inspector/element-registry.ts';
import { registerElement } from '@app/utils/element-registry';

type SelectionShape = HTMLElement & { x: number; y: number };
type MarqueeShape = HTMLElement & {
	customSelect(key: 'source' | 'destination', x: number, y: number): void;
	customUnselect(key: 'source' | 'destination'): void;
	customShiftAutoTile(): void;
	scaleX: number;
	scaleY: number;
};

describe('Palette selection 元素 Vue 渲染（拖拽选区覆盖层）', () => {
	let marquee: MarqueeShape;

	const append = (id: string): void => {
		const el = document.createElement('div');
		el.id = id;
		document.body.appendChild(el);
		// P5b 批次 4：模块改从注册表取元素（不再查 DOM），测试需按新契约登记
		registerElement(paletteEls, id, el);
	};

	beforeAll(() => {
		append('palette-frame');
		append('fileTileset');
		registerElement(inspectorEls, 'fileTileset', document.getElementById('fileTileset'));
		append('palette-head');
		append('palette-body');
		const canvas = document.createElement('canvas');
		canvas.id = 'palette-canvas';
		document.body.appendChild(canvas);
		registerElement(paletteEls, 'palette-canvas', canvas);
		append('palette-screen');
		append('palette-marquee');
		append('palette-scroll');
		append('palette-priority');
		append('palette-tag');
		append('palette-terrain');
		append('palette-edit');
		append('palette-zoom');
		append('fileTileset-general-detail');
		Palette.initialize();
		marquee = document.getElementById('palette-marquee') as unknown as MarqueeShape;
		marquee.scaleX = 32;
		marquee.scaleY = 32;
	});

	afterAll(() => {
		document.body.innerHTML = '';
	});

	it('initialize 后 marquee 不包含任何 selection', () => {
		expect(marquee.querySelectorAll('selection').length).toBe(0);
	});

	it('customSelect 渲染 source-selection 并设置位置/尺寸/坐标', () => {
		marquee.customSelect('source', 2, 3);
		const selection = marquee.querySelector('selection') as SelectionShape;
		expect(selection).toBeTruthy();
		expect(selection.id).toBe('source-selection');
		expect(selection.tagName).toBe('SELECTION');
		expect(selection.style.left).toBe('64px');
		expect(selection.style.top).toBe('96px');
		expect(selection.style.width).toBe('32px');
		expect(selection.style.height).toBe('32px');
		expect(selection.x).toBe(2);
		expect(selection.y).toBe(3);
	});

	it('customSelect destination 与 source 同坐标时移除自身', () => {
		marquee.customSelect('destination', 5, 6);
		expect(document.getElementById('destination-selection')).toBeTruthy();
		marquee.customSelect('destination', 2, 3);
		expect(document.getElementById('destination-selection')).toBeNull();
	});

	it('customUnselect 移除对应 selection', () => {
		marquee.customSelect('source', 1, 1);
		expect(document.getElementById('source-selection')).toBeTruthy();
		marquee.customUnselect('source');
		expect(document.getElementById('source-selection')).toBeNull();
	});

	it('customShiftAutoTile 移除双选区并交换图块', () => {
		marquee.customSelect('source', 1, 1);
		marquee.customSelect('destination', 2, 1);
		Palette.tileset = {
			width: 4,
			tiles: [0, 0, 0, 0, 0, 1, 0, 0],
			priorities: [0, 0, 0, 0, 0, 0, 0, 0],
			terrains: [0, 0, 0, 0, 0, 0, 0, 0]
		};
		marquee.customShiftAutoTile();
		expect(marquee.querySelectorAll('selection').length).toBe(0);
		const { tiles } = Palette.tileset;
		expect(tiles[5]).toBe(0);
		expect(tiles[6]).toBe(1);
	});
});
