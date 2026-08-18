import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.mock('@app/engine/webgl/webgl-init.ts', () => {
	const mockGL = {
		width: 800,
		height: 600,
		flip: -1,
		maxTexSize: 4096,
		createTexture: vi.fn(() => ({})),
		deleteTexture: vi.fn(),
		bindTexture: vi.fn(),
		texImage2D: vi.fn(),
		texParameteri: vi.fn(),
		RGBA: 0x1908,
		UNSIGNED_BYTE: 0x1401,
		TEXTURE_2D: 0x0de1,
		TEXTURE_MAG_FILTER: 0x2800,
		TEXTURE_MIN_FILTER: 0x2801,
		TEXTURE_WRAP_S: 0x2802,
		TEXTURE_WRAP_T: 0x2803,
		NEAREST: 0x2600,
		LINEAR: 0x2601,
		CLAMP_TO_EDGE: 0x812f,
		textureManager: {
			map: {} as Record<string, any>,
			delete: vi.fn(),
			images: {} as Record<string, any>
		},
		maxTexUnits: 16,
		program: null as any,
		graphicProgram: { use: vi.fn(() => ({ vao: {}, u_Matrix: {} })), vao: {}, u_Matrix: {} },
		imageProgram: {
			use: vi.fn(() => ({
				vao: {},
				u_Matrix: {},
				u_LightMode: {},
				u_ColorMode: {},
				u_Tint: {},
				u_Color: {}
			})),
			vao: {},
			u_Matrix: {},
			u_LightMode: {},
			u_ColorMode: {},
			u_Tint: {},
			u_Color: {}
		},
		arrays: [
			{ float32: new Uint32Array(512 * 512 * 6), uint32: new Uint32Array(512 * 512 * 6) }
		],
		bindVertexArray: vi.fn(),
		bufferData: vi.fn(),
		drawElements: vi.fn(),
		activeTexture: vi.fn(),
		updateSamplerNum: vi.fn(),
		updateBlending: vi.fn(),
		STREAM_DRAW: 0x88e0,
		ARRAY_BUFFER: 0x8892,
		TRIANGLES: 0x0004,
		UNSIGNED_INT: 0x1405,
		TEXTURE0: 0x84c0,
		matrix: {
			set: vi.fn().mockReturnThis(),
			multiply: vi.fn().mockReturnThis(),
			project: vi.fn().mockReturnThis(),
			reset: vi.fn().mockReturnThis(),
			translate: vi.fn().mockReturnThis(),
			scale: vi.fn().mockReturnThis()
		},
		frameBuffer: {},
		binding: null,
		context2d: {
			createImageData: vi.fn(() => ({ data: { buffer: new ArrayBuffer(4), length: 4 } }))
		},
		bindFramebuffer: vi.fn(),
		framebufferTexture2D: vi.fn(),
		readPixels: vi.fn(),
		clearColor: vi.fn(),
		clear: vi.fn(),
		bindFBO: vi.fn(),
		unbindFBO: vi.fn(),
		fillRect: vi.fn(),
		enable: vi.fn(),
		disable: vi.fn(),
		scissor: vi.fn(),
		isEnabled: vi.fn(() => false),
		getParameter: vi.fn(() => [0, 0, 0, 0]),
		maskTexture: { binding: null, width: 0, height: 0, fbo: {} },
		depthTest: false,
		masking: false,
		alpha: 1,
		blend: 'normal',
		uniformMatrix3fv: vi.fn(),
		uniform1i: vi.fn(),
		uniform4f: vi.fn(),
		drawImage: vi.fn(),
		drawSliceImage: vi.fn(),
		LINE_LOOP: 0x0002,
		TRIANGLE_FAN: 0x0006,
		SCISSOR_TEST: 0x0c11,
		COLOR_BUFFER_BIT: 0x4000,
		FRAMEBUFFER: 0x8d40,
		COLOR_ATTACHMENT0: 0x8ce0,
		DEPTH_TEST: 0x0b71,
		BACKGROUND_RED: 0.78,
		BACKGROUND_GREEN: 0.78,
		BACKGROUND_BLUE: 0.78,
		createNormalTexture: vi.fn(() => ({ glTexture: {}, width: 0, height: 0, format: 0x1908 })),
		createImageTexture: vi.fn(() => ({
			glTexture: {},
			width: 0,
			height: 0,
			format: 0x1908,
			image: null,
			index: undefined,
			refCount: 0,
			on: vi.fn(),
			reply: vi.fn(),
			restoreNormalTexture: vi.fn(),
			restoreImageTexture: vi.fn()
		})),
		MIN: 0x8007,
		MAX: 0x8008,
		WEBGL_lose_context: null,
		restore: vi.fn()
	};
	return { GL: mockGL };
});

vi.mock('@app/legacy/file/file-system-core.ts', () => ({
	File: { get: vi.fn() }
}));

vi.mock('@app/legacy/ui/ui-window.ts', () => {
	const Matrix = {
		set: vi.fn().mockReturnThis(),
		multiply: vi.fn().mockReturnThis(),
		rotateAt: vi.fn().mockReturnThis(),
		scaleAt: vi.fn().mockReturnThis(),
		skewAt: vi.fn().mockReturnThis(),
		project: vi.fn().mockReturnThis(),
		reset: vi.fn().mockReturnThis(),
		translate: vi.fn().mockReturnThis()
	};
	return {
		UI: {
			Element: class {},
			Window: class {},
			Root: class {},
			matrix: Matrix,
			width: 800,
			height: 600,
			requestRendering: vi.fn()
		}
	};
});

import { Vector } from '@app/engine/webgl/vector2.ts';
import { Matrix } from '@app/engine/webgl/matrix2.ts';
import { GL } from '@app/engine/webgl/webgl-init.ts';
import { BaseTexture } from '@app/engine/webgl/base-texture.ts';
import { TextureManager } from '@app/engine/webgl/texture-manager.ts';
import { BatchRenderer } from '@app/engine/webgl/batch-renderer.ts';
import { Texture } from '@app/engine/webgl/texture.ts';

describe('Vector', () => {
	it('默认构造为零向量', () => {
		const v = new Vector();
		expect(v.x).toBe(0);
		expect(v.y).toBe(0);
	});

	it('set 设置坐标并返回自身', () => {
		const v = new Vector();
		const result = v.set(3, 4);
		expect(v.x).toBe(3);
		expect(v.y).toBe(4);
		expect(result).toBe(v);
	});

	it('length 计算向量模', () => {
		const v = new Vector(3, 4);
		expect(v.length).toBeCloseTo(5);
	});

	it('length setter 缩放向量', () => {
		const v = new Vector(3, 4);
		v.length = 10;
		expect(v.length).toBeCloseTo(10);
		expect(v.x).toBeCloseTo(6);
		expect(v.y).toBeCloseTo(8);
	});

	it('length setter 零向量不变', () => {
		const v = new Vector(0, 0);
		v.length = 5;
		expect(v.x).toBe(0);
		expect(v.y).toBe(0);
	});

	it('add 向量加法', () => {
		const v = new Vector(1, 2);
		v.add(new Vector(3, 4));
		expect(v.x).toBe(4);
		expect(v.y).toBe(6);
	});

	it('normalize 将向量单位化', () => {
		const v = new Vector(3, 4);
		v.normalize();
		expect(v.length).toBeCloseTo(1);
	});

	it('cos 计算两向量夹角余弦', () => {
		const a = new Vector(1, 0);
		const b = new Vector(0, 1);
		expect(a.cos(b)).toBeCloseTo(0);
	});

	it('sin 计算两向量夹角正弦', () => {
		const a = new Vector(1, 0);
		const b = new Vector(0, 1);
		expect(a.sin(b)).toBeCloseTo(1);
	});
});

describe('Matrix', () => {
	it('构造为单位矩阵', () => {
		const m = new Matrix();
		expect(m[0]).toBe(1);
		expect(m[4]).toBe(1);
		expect(m[8]).toBe(1);
		expect(m[1]).toBe(0);
		expect(m[3]).toBe(0);
		expect(m[6]).toBe(0);
		expect(m[7]).toBe(0);
	});

	it('reset 恢复单位矩阵', () => {
		const m = new Matrix();
		m[0] = 5;
		m[4] = 3;
		m.reset();
		expect(m[0]).toBe(1);
		expect(m[4]).toBe(1);
		expect(m[1]).toBe(0);
	});

	it('set 从另一矩阵复制', () => {
		const a = new Matrix();
		const b = new Matrix();
		b[0] = 2;
		b[1] = 3;
		b[3] = 4;
		b[4] = 5;
		b[6] = 6;
		b[7] = 7;
		const result = a.set(b);
		expect(a[0]).toBe(2);
		expect(a[1]).toBe(3);
		expect(a[3]).toBe(4);
		expect(a[4]).toBe(5);
		expect(a[6]).toBe(6);
		expect(a[7]).toBe(7);
		expect(result).toBe(a);
	});

	it('set6f 从六个参数设置', () => {
		const m = new Matrix();
		m.set6f(1, 2, 3, 4, 5, 6);
		expect(m[0]).toBe(1);
		expect(m[1]).toBe(2);
		expect(m[3]).toBe(3);
		expect(m[4]).toBe(4);
		expect(m[6]).toBe(5);
		expect(m[7]).toBe(6);
	});

	it('multiply 单位矩阵相乘不变', () => {
		const a = new Matrix();
		const b = new Matrix();
		a.multiply(b);
		expect(a[0]).toBe(1);
		expect(a[4]).toBe(1);
		expect(a[1]).toBe(0);
	});

	it('translate 平移矩阵', () => {
		const m = new Matrix();
		m.translate(10, 20);
		expect(m[6]).toBe(10);
		expect(m[7]).toBe(20);
	});

	it('scale 缩放矩阵', () => {
		const m = new Matrix();
		m.scale(2, 3);
		expect(m[0]).toBe(2);
		expect(m[1]).toBe(0);
		expect(m[3]).toBe(0);
		expect(m[4]).toBe(3);
	});

	it('rotate 旋转矩阵', () => {
		const m = new Matrix();
		m.rotate(0);
		expect(m[0]).toBeCloseTo(1);
		expect(m[4]).toBeCloseTo(1);
	});

	it('mirrorh 水平镜像', () => {
		const m = new Matrix();
		m.mirrorh();
		expect(m[0]).toBe(-1);
		expect(m[3]).toBeCloseTo(0);
	});

	it('mirrorv 垂直镜像', () => {
		const m = new Matrix();
		m.mirrorv();
		expect(m[1]).toBeCloseTo(0);
		expect(m[4]).toBe(-1);
	});

	it('project 设置投影矩阵', () => {
		const m = new Matrix();
		m.project(-1, 800, 600);
		expect(m[0]).toBeCloseTo(2 / 800);
		expect(m[4]).toBeCloseTo(-2 / 600);
		expect(m[6]).toBe(-1);
		expect(m[7]).toBe(1);
	});
});

describe('BaseTexture', () => {
	beforeEach(() => {
		(GL as any).createTexture.mockClear();
	});

	it('构造时创建 WebGL 纹理', () => {
		const tex = new BaseTexture();
		expect(GL.createTexture).toHaveBeenCalled();
		expect(tex.width).toBe(0);
		expect(tex.height).toBe(0);
		expect(tex.format).toBe(GL.RGBA);
	});

	it('on + reply 触发 load 回调', () => {
		const tex = new BaseTexture();
		const cb = vi.fn();
		tex.on('load', cb);
		tex.reply('load');
		expect(cb).toHaveBeenCalledWith(tex);
	});

	it('on 已 reply 后直接调用回调', () => {
		const tex = new BaseTexture();
		tex.reply('load');
		const cb = vi.fn();
		tex.on('load', cb);
		expect(cb).toHaveBeenCalledWith(tex);
	});

	it('on 添加多个回调', () => {
		const tex = new BaseTexture();
		const cb1 = vi.fn();
		const cb2 = vi.fn();
		tex.on('load', cb1);
		tex.on('load', cb2);
		tex.reply('load');
		expect(cb1).toHaveBeenCalled();
		expect(cb2).toHaveBeenCalled();
	});
});

describe('TextureManager', () => {
	beforeEach(() => {
		(GL as any).createTexture.mockClear();
		(GL as any).deleteTexture.mockClear();
		(GL as any).textureManager.delete.mockClear();
	});

	it('append 添加纹理到映射表', () => {
		const mgr = new TextureManager();
		const tex = new BaseTexture();
		mgr.append(tex);
		expect(mgr.count).toBe(1);
		expect(tex.index).toBe(0);
		expect(mgr.map[0]).toBe(tex);
	});

	it('append 已有 index 的纹理不重复添加', () => {
		const mgr = new TextureManager();
		const tex = new BaseTexture();
		tex.index = 5;
		mgr.append(tex);
		expect(mgr.count).toBe(0);
	});

	it('delete 移除纹理并释放 GL 纹理', () => {
		const mgr = new TextureManager();
		const tex = new BaseTexture();
		mgr.append(tex);
		mgr.delete(tex);
		expect(mgr.map[0]).toBeUndefined();
		expect(mgr.count).toBe(0);
		expect(GL.deleteTexture).toHaveBeenCalled();
	});

	it('clear 移除所有非 protected 纹理', () => {
		const mgr = new TextureManager();
		const tex1 = new BaseTexture();
		const tex2 = new BaseTexture();
		(tex2 as any).protected = true;
		mgr.append(tex1);
		mgr.append(tex2);
		mgr.clear();
		expect(mgr.count).toBe(1);
		expect(mgr.map[tex1.index as number]).toBeUndefined();
		expect(mgr.map[tex2.index as number]).toBe(tex2);
	});
});

describe('BatchRenderer', () => {
	it('push 返回顶点索引和采样器索引', () => {
		const renderer = new BatchRenderer(GL as any);
		renderer.setAttrSize(6);
		renderer.push(0);
		expect(renderer.response[0]).toBe(0);
		expect(renderer.response[1]).toBe(0);
		renderer.push(0);
		expect(renderer.response[0]).toBe(4);
		expect(renderer.response[1]).toBe(0);
	});

	it('getEndIndex 返回当前顶点索引', () => {
		const renderer = new BatchRenderer(GL as any);
		renderer.setAttrSize(6);
		expect(renderer.getEndIndex()).toBe(0);
		renderer.push(0);
		expect(renderer.getEndIndex()).toBe(4);
	});

	it('setBlendMode 切换混合模式触发 draw', () => {
		const renderer = new BatchRenderer(GL as any);
		renderer.setAttrSize(6);
		(GL as any).textureManager.map[0] = { glTexture: {} };
		renderer.push(0);
		renderer.bindProgram(GL.program);
		(GL as any).bufferData.mockClear();
		renderer.setBlendMode('add');
		expect((GL as any).bufferData).toHaveBeenCalled();
	});

	it('draw 调用 bufferData 和 drawElements', () => {
		const renderer = new BatchRenderer(GL as any);
		renderer.setAttrSize(6);
		(GL as any).textureManager.map[0] = { glTexture: {} };
		renderer.push(0);
		renderer.bindProgram(GL.program);
		renderer.draw();
		expect(GL.bufferData).toHaveBeenCalled();
		expect(GL.drawElements).toHaveBeenCalled();
	});
});

describe('Texture', () => {
	beforeEach(() => {
		(GL as any).createTexture.mockClear();
	});

	it('clip 设置裁剪区域并返回自身', () => {
		const tex = new Texture();
		const result = tex.clip(10, 20, 100, 50);
		expect(tex.x).toBe(10);
		expect(tex.y).toBe(20);
		expect(tex.width).toBe(100);
		expect(tex.height).toBe(50);
		expect(result).toBe(tex);
	});

	it('fromImage 空图像调用 resize(0,0)', () => {
		const tex = new Texture();
		tex.fromImage(null);
		expect(tex.width).toBe(0);
		expect(tex.height).toBe(0);
	});

	it('destroy 后 base 为 null', () => {
		const tex = new Texture();
		expect(tex.base).not.toBeNull();
		tex.destroy();
		expect(tex.base).toBeNull();
		expect(tex.complete).toBe(false);
	});
});
