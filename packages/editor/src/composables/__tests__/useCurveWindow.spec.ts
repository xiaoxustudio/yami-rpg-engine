import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useCurveWindow, type CurveFrame } from '@app/composables/useCurveWindow';
import { Animation } from '@app/animation/animation-window.ts';
import { Data } from '@app/data/data-object.ts';
import { Easing } from '@app/data/transition-window.ts';
import { Timer } from '@app/utils/timer';

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ syncState: vi.fn() })
}));

vi.mock('@app/animation/animation-window.ts', () => ({
	Animation: {
		planToSave: vi.fn(),
		history: { save: vi.fn() },
		motion: { id: 'motion-1' },
		direction: 0,
		target: null
	}
}));

vi.mock('@app/data/data-object.ts', () => ({
	Data: {
		easings: { map: {} },
		createEasingItems: vi.fn(() => [])
	}
}));

vi.mock('@app/data/transition-window.ts', () => {
	const curveMap = { count: 0, update: vi.fn() };
	return {
		Easing: {
			CurveMap: vi.fn(function () {
				return curveMap;
			}),
			startPoint: { x: 0, y: 0 },
			endPoint: { x: 1, y: 1 },
			open: vi.fn()
		}
	};
});

vi.mock('@app/engine/layout/layout.ts', () => ({
	Layout: {
		getGroupOfElement: vi.fn(() => ({
			nav: {
				getBoundingClientRect: () => ({ left: 10, right: 50 }),
				lastChild: { getBoundingClientRect: () => ({ right: 90 }) }
			}
		}))
	}
}));

vi.mock('@app/utils/timer', () => ({
	Timer: { appendUpdater: vi.fn(), removeUpdater: vi.fn() }
}));

const getPage = (): HTMLElement => document.getElementById('animation-easing') as HTMLElement;

const getList = (): HTMLElement & { loadItems: (items: unknown[]) => void } =>
	document.getElementById('animation-easing-id') as unknown as HTMLElement & {
		loadItems: (items: unknown[]) => void;
	};

const getCanvas = (): HTMLElement & {
	width: number;
	height: number;
	textColor?: string;
	gridColor?: string;
	axisColor?: string;
	curveColor?: string;
} =>
	document.getElementById('animation-easing-canvas') as HTMLElement & {
		width: number;
		height: number;
		textColor?: string;
		gridColor?: string;
		axisColor?: string;
		curveColor?: string;
	};

const mountAndInit = async (): Promise<{
	curve: ReturnType<typeof useCurveWindow>;
}> => {
	const page = getPage();
	Object.defineProperty(page, 'clientWidth', { value: 300 });
	getList().loadItems = vi.fn();
	const curve = useCurveWindow();
	curve.initialize();
	return { curve };
};

describe('useCurveWindow（动画过渡曲线窗口 composable：渲染状态机 + open/load/close）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		document.body.innerHTML = `
			<div id="animation-easing">
				<div id="animation-easing-head"></div>
				<div id="animation-easing-settings"></div>
				<div id="animation-easing-id"></div>
				<canvas id="animation-easing-canvas" width="0" height="0"></canvas>
			</div>
		`;
		vi.stubGlobal('CSS', {
			getDevicePixelContentBoxSize: () => ({ width: 100, height: 50 })
		});
		vi.mocked(Data).easings = { map: {} };
		vi.mocked(Animation).history.save.mockClear();
		vi.mocked(Animation).planToSave.mockClear();
		vi.mocked(Timer.appendUpdater)!.mockClear();
		vi.mocked(Timer.removeUpdater)!.mockClear();
		vi.mocked(Easing).open.mockClear();
	});

	it('initialize 绑定 DOM、创建曲线图与默认项', async () => {
		const { curve } = await mountAndInit();
		expect(curve.list?.defaultItem).toEqual({ name: 'No Easing', value: '' });
		expect(curve.curveMap).toBeTruthy();
		expect(getPage().classList.contains('hidden')).toBe(true);
		expect(getList().classList.contains('hidden')).toBe(true);
	});

	it('list.setItemNames 按默认项映射显示名称', async () => {
		const { curve } = await mountAndInit();
		curve.list?.setItemNames?.({ '': 'No Easing' });
		expect(curve.list?.defaultItem.name).toBe('No Easing');
		curve.list?.setItemNames?.({ '': 'Linear' });
		expect(curve.list?.defaultItem.name).toBe('Linear');
	});

	it('open 显示页面、填充 easing 选项并启动渲染', async () => {
		const { curve } = await mountAndInit();
		curve.open();
		expect(curve.state).toBe('open');
		expect(getPage().classList.contains('hidden')).toBe(false);
		expect(getCanvas().width).toBe(100);
		expect(Data.createEasingItems).toHaveBeenCalled();
		expect(Timer.appendUpdater).toHaveBeenCalledWith(
			'sharedRendering2',
			curve.renderingFunction
		);
	});

	it('load 载入目标帧写入 easingId，load(null) 清空选择', async () => {
		const { curve } = await mountAndInit();
		const key = document.createElement('div');
		const frame = { easingId: 'easing-1', key };
		curve.load(frame);
		expect(curve.target).toBe(frame);
		expect(getList().classList.contains('hidden')).toBe(false);
		expect(getList().dataValue).toBe('easing-1');
		curve.load(null);
		expect(curve.target).toBeNull();
		expect(curve.index).toBeNull();
	});

	it('load 同一目标不重复载入', async () => {
		const { curve } = await mountAndInit();
		const key = document.createElement('div');
		const frame = { easingId: 'easing-1', key };
		curve.load(frame);
		curve.load(frame);
		expect(getList().dataValue).toBe('easing-1');
	});

	it('easingIdWrite 更新选中 id 并刷新曲线', async () => {
		const { curve } = await mountAndInit();
		curve.open();
		const event = new Event('write') as Event & { value?: string };
		event.value = 'easing-1';
		curve.easingIdWrite(event);
		expect(curve.index).toBe('easing-1');
		expect(Timer.appendUpdater).toHaveBeenCalledWith(
			'sharedRendering2',
			curve.renderingFunction
		);
	});

	it('easingIdInput 保存历史、写入目标帧并更新时间轴样式', async () => {
		const { curve } = await mountAndInit();
		const key = document.createElement('div');
		const frame = { easingId: 'easing-1', key } as CurveFrame;
		curve.load(frame);
		curve.open();
		const event = new Event('input') as Event & { value?: string };
		event.value = 'easing-2';
		curve.easingIdInput(event);
		expect(Animation.planToSave).toHaveBeenCalled();
		expect(Animation.history.save).toHaveBeenCalledWith(
			expect.objectContaining({
				type: 'animation-easing-change',
				target: frame,
				easingId: 'easing-1'
			})
		);
		expect(frame.easingId).toBe('easing-2');
		expect(key.classList.contains('easing')).toBe(true);
	});

	it('themechange 切换画布配色', async () => {
		const { curve: _curve } = await mountAndInit();
		const event = new Event('themechange') as Event & { value?: string };
		event.value = 'dark';
		window.dispatchEvent(event);
		expect(getCanvas().gridColor).toBe('#404040');
		expect(getCanvas().curveColor).toBe('#d8d8d8');
	});

	it('datachange 重置选中并刷新选项', async () => {
		const { curve } = await mountAndInit();
		curve.open();
		const writeEvent = new Event('write') as Event & { value?: string };
		writeEvent.value = 'easing-1';
		curve.easingIdWrite(writeEvent);
		const event = new Event('datachange') as Event & { key?: string };
		event.key = 'easings';
		window.dispatchEvent(event);
		expect(curve.index).toBeNull();
		expect(getList().dataValue).toBe('easing-1');
	});

	it('settingsPointerdown 打开过渡窗口', async () => {
		const { curve } = await mountAndInit();
		curve.settingsPointerdown(new PointerEvent('pointerdown'));
		expect(Easing.open).toHaveBeenCalled();
	});

	it('close 关闭页面并停止渲染', async () => {
		const { curve } = await mountAndInit();
		curve.open();
		curve.close();
		expect(curve.state).toBe('closed');
		expect(getPage().classList.contains('hidden')).toBe(true);
		expect(Timer.removeUpdater).toHaveBeenCalledWith(
			'sharedRendering2',
			curve.renderingFunction
		);
	});

	it('legacy Curve 入口 initialize/open/close/load 转发 composable', async () => {
		const { Curve: CurveController } = await import('@app/animation/curve-window.ts');
		const page = getPage();
		Object.defineProperty(page, 'clientWidth', { value: 300 });
		getList().loadItems = vi.fn();
		CurveController.initialize!();
		CurveController.open!();
		expect(CurveController.state).toBe('open');
		const key = document.createElement('div');
		const frame = { easingId: 'easing-1', key };
		CurveController.load!(frame);
		expect(CurveController.target).toBe(frame);
		CurveController.easingIdWrite?.({ value: 'easing-2' } as Event);
		expect(CurveController.index).toBe('easing-2');
		CurveController.close!();
		expect(CurveController.state).toBe('closed');
	});
});
