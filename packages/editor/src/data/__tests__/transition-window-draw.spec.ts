import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Easing } from '@app/data/transition-window.ts';
import { File } from '@app/file/file-system-core.ts';

const drawImageCalls: unknown[][] = [];

function createFakeContext() {
	return {
		strokeStyle: '',
		fillStyle: '',
		lineWidth: 1,
		font: '',
		textBaseline: '',
		clearRect: () => {},
		beginPath: () => {},
		moveTo: () => {},
		lineTo: () => {},
		stroke: () => {},
		setLineDash: () => {},
		fillText: () => {},
		translate: () => {},
		rotate: () => {},
		setTransform: () => {},
		drawImage: (...args: unknown[]) => {
			drawImageCalls.push(args);
		}
	};
}

function createFakeCanvas() {
	return {
		width: 300,
		height: 300,
		spacing: 20,
		centerX: 150,
		centerY: 150,
		gridColor: '#404040',
		axisColor: '#808080',
		textColor: '#808080',
		curveColor: '#000000',
		curveColorActive: '#d8d8d8',
		linkColorActive: '#00bbff',
		context: createFakeContext(),
		getContext: () => null
	};
}

/** 装上 `drawCurve` 真正读到的那些槽位（真实流程里由 initialize()/open() 填充） */
function installRuntime() {
	Easing.curve = createFakeCanvas() as unknown as typeof Easing.curve;
	Easing.points = [
		{ x: 0, y: 0 },
		{ x: 1, y: 1 }
	];
	Easing.startPoint = { x: 0, y: 0 };
	Easing.endPoint = { x: 1, y: 1 };
	Easing.activePoint = null;
	Easing.scale = 1;
	Easing.elapsed = 0;
	Easing.duration = 1000;
	Easing.curveMap = [0, 0, 0.5, 0.5, 1, 1] as unknown as typeof Easing.curveMap;
	Easing.easingMap = [0, 0.5, 1] as unknown as typeof Easing.easingMap;
	Easing.pointImage = null;
}

const readyImage = { width: 7, height: 25 } as unknown as CanvasImageSource;

describe('Easing.drawCurve 的标记图守卫', () => {
	const originalGet = File.get;

	beforeEach(() => {
		drawImageCalls.length = 0;
		installRuntime();
	});

	afterEach(() => {
		File.get = originalGet;
		vi.restoreAllMocks();
	});

	it('标记图未加载（undefined）时不抛错也不画', () => {
		Easing.pointImage = undefined as unknown as typeof Easing.pointImage;

		expect(() => Easing.drawCurve()).not.toThrow();
		expect(drawImageCalls).toHaveLength(0);
	});

	it('标记图为 null 时不抛错也不画', () => {
		Easing.pointImage = null;

		expect(() => Easing.drawCurve()).not.toThrow();
		expect(drawImageCalls).toHaveLength(0);
	});

	it('标记图加载失败（naturalWidth 为 0）时跳过标记绘制', () => {
		Easing.pointImage = document.createElement('img');

		expect(() => Easing.drawCurve()).not.toThrow();
		expect(drawImageCalls).toHaveLength(0);
	});

	it('标记图就绪时正常绘制（2 个点各 2 次 drawImage）', () => {
		Easing.pointImage = readyImage;

		expect(() => Easing.drawCurve()).not.toThrow();
		expect(drawImageCalls).toHaveLength(4);
		for (const args of drawImageCalls) {
			expect(args[0]).toBe(readyImage);
		}
	});

	it('createPointImage 加载成功后写入 pointImage 并补一次重绘', async () => {
		const requestRendering = vi.spyOn(Easing, 'requestRendering');
		File.get = vi.fn(() => Promise.resolve(readyImage)) as unknown as typeof File.get;

		Easing.createPointImage();
		await vi.waitFor(() => expect(Easing.pointImage).toBe(readyImage));
		expect(requestRendering).toHaveBeenCalled();
		expect(File.get).toHaveBeenCalledWith({ local: 'Images/curve_mark.png', type: 'image' });
	});

	it('createPointImage 拿到坏图时不落缓存（留给下次窗口打开重试）', async () => {
		const broken = document.createElement('img');
		let resolveGet: (image: HTMLImageElement) => void = () => {};
		File.get = vi.fn(
			() =>
				new Promise<HTMLImageElement>((resolve) => {
					resolveGet = resolve;
				})
		) as unknown as typeof File.get;

		Easing.createPointImage();
		resolveGet(broken);
		await vi.waitFor(() => expect(File.get).toHaveBeenCalled());

		expect(Easing.pointImage).toBe(null);
	});

	it('createPointImage 已有就绪图片时不再重复请求', () => {
		Easing.pointImage = readyImage;
		File.get = vi.fn() as unknown as typeof File.get;

		Easing.createPointImage();

		expect(File.get).not.toHaveBeenCalled();
	});
});
