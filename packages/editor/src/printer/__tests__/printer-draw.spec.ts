import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

// Printer 只用到 GL 的 `arrays`（charWidths 视图）与 `maxTexSize`；其余重模块在 draw 路径上
// 也用不到，全部挡掉，避免把它们庞大的启动副作用带进 jsdom。
vi.mock('@app/engine/webgl/webgl-init.ts', () => ({
	GL: { arrays: [{}, { uint32: new Uint32Array(4096) }], maxTexSize: 4096 }
}));
vi.mock('@app/engine/webgl/texture.ts', () => ({ Texture: class Texture {} }));
vi.mock('@app/data/data-object.ts', () => ({ Data: { config: { indexedColors: [], text: {} } } }));
vi.mock('@app/file/file-system-core.ts', () => ({ File: {} }));
vi.mock('@app/inspector/inspector.ts', () => ({ Inspector: {} }));
vi.mock('@app/ui/ui-window.ts', () => ({ UI: {} }));
vi.mock('@app/title/title-bar.ts', () => ({ Title: {} }));

import { Printer } from '@app/printer/printer.ts';
import type { Texture as PrinterTexture } from '@app/engine/webgl/texture.ts';

/**
 * `Printer.draw` 的回归测试：这条路径曾经在运行时炸
 * `TypeError: this.context.resize is not a function`——画布尺寸调整原本挂在
 * `CanvasRenderingContext2D.prototype` 上的内建补丁里，补丁被当成死代码删掉后，
 * 因为 `this.context` 的调用形式逃过了静态检索，测试也没覆盖到这里。
 *
 * 因此这里的假上下文**故意不提供** `resize`：只要有人再往上下文上挂非标准方法，
 * `draw()` 就会立刻抛错。
 */
const fillTextCalls: Array<{ text: string; x: number; y: number }> = [];

function createFakeContext(canvas: HTMLCanvasElement) {
	return {
		canvas,
		font: '',
		fillStyle: '',
		strokeStyle: '',
		globalCompositeOperation: 'source-over',
		lineJoin: 'miter',
		lineWidth: 1,
		paddingItalic: 0,
		paddingVertical: 0,
		size: 0,
		measureText: (text: string) => ({ width: text.length * 8 }),
		fillText: (text: string, x: number, y: number) => {
			fillTextCalls.push({ text, x, y });
		},
		strokeText: () => {},
		save: () => {},
		restore: () => {},
		clearRect: () => {}
	};
}

function createTexture() {
	return {
		base: {},
		fromImage: vi.fn()
	} as unknown as PrinterTexture;
}

describe('Printer.draw', () => {
	let originalGetContext: typeof HTMLCanvasElement.prototype.getContext;
	let canvases: HTMLCanvasElement[] = [];

	beforeAll(() => {
		originalGetContext = HTMLCanvasElement.prototype.getContext;
		// oxlint-disable-next-line unbound-method
		HTMLCanvasElement.prototype.getContext = function (
			this: HTMLCanvasElement,
			contextId: string
		): unknown {
			if (contextId !== '2d') return null;
			canvases.push(this);
			return createFakeContext(this);
		} as typeof HTMLCanvasElement.prototype.getContext;

		Printer.font = 'sans-serif';
		Printer.size = 16;
		Printer.color = '#ffffffff';
		Printer.effect = { type: 'none' };
		Printer.scale = 1;
		Printer.sizeScale = 1;
		Printer.highDefinition = false;
		Printer.languageFont = '';
		Printer.wordWrap = 'break';
		Printer.initialize();
	});

	afterAll(() => {
		HTMLCanvasElement.prototype.getContext = originalGetContext;
	});

	beforeEach(() => {
		canvases = [];
		fillTextCalls.length = 0;
	});

	it('绘制文本时按内容调整画布尺寸，而不是调用上下文的 resize', () => {
		const texture = createTexture();
		const printer = new Printer(texture);

		expect(() => printer.draw('abc')).not.toThrow();

		const canvas = canvases[0];
		expect(canvas.width).toBeGreaterThan(0);
		expect(canvas.height).toBeGreaterThan(0);
		expect(fillTextCalls.map((call) => call.text)).toEqual(['abc']);
		expect(texture.fromImage).toHaveBeenCalledWith(canvas);
	});

	it('重复绘制同样内容时尺寸稳定', () => {
		const printer = new Printer(createTexture());
		printer.draw('abc');
		const { width, height } = canvases[0];

		// 真实调用方（`TextElement.updatePrinter`、`Printer.restoreTexture`）在重绘前会
		// `reset()`：`draw()` 自己只清内容，不清 x/y/width/height。
		printer.reset();
		expect(() => printer.draw('abc')).not.toThrow();
		expect(canvases[0].width).toBe(width);
		expect(canvases[0].height).toBe(height);
	});

	it('竖排文本走 context.measureText 的逐字测量路径', () => {
		const printer = new Printer(createTexture());
		printer.direction = 'vertical-rl';

		expect(() => printer.draw('ab\ncd')).not.toThrow();
		expect(fillTextCalls.length).toBeGreaterThan(0);
		expect(canvases[0].height).toBeGreaterThan(0);
	});
});
