import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import AutoTileSelectNode from '@app/components/tools/AutoTileSelectNode.vue';
import { useTileNodeWindow } from '@app/composables/useTileNodeWindow';
import { Window } from '@app/tools/window-object.ts';
import { Palette } from '@app/palette/palette.ts';
import { Scene } from '@app/scene/scene-window.ts';
import { Timer } from '@app/utils/timer';
import { elementDataOf } from '@ui-kit';
import '@app/utils/math';

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ syncState: vi.fn() }),
	getLocalStore: () => ({ syncState: vi.fn() })
}));

vi.mock('@app/palette/palette.ts', () => ({
	Palette: {
		tileset: { tileWidth: 32, tileHeight: 32 },
		updateBackground: vi.fn(),
		explicit: false,
		marquee: null
	}
}));

vi.mock('@app/scene/scene-window.ts', () => ({
	Scene: {
		marquee: null
	}
}));

/**
 * `Scene.marquee.key` 是**元素数据**（生产侧由 `scene-marquee-engine.ts` / `palette-engine.ts` /
 * `scene-window.ts` 写入场景选框元素），不再有原型访问器 ⇒ 夹具必须是**真元素**并显式写元素数据，
 * 否则 `sceneMarqueeData(...).key` 恒为 `undefined`，代码会走 `saveData.tile.tiles` 分支并抛错
 * （表现为 Enter/pointerup 后选区根本没写进 `tiles`）。
 */
const sceneMarquee = (tiles: number[], key: string | null = 'tile'): typeof Scene.marquee => {
	const el = document.createElement('div');
	elementDataOf<{ key?: string | null }>(el).key = key;
	return Object.assign(el, { tiles, saveData: {} }) as unknown as typeof Scene.marquee;
};

type MarqueeEl = HTMLElement & {
	visible: boolean;
	x: number;
	y: number;
	scaleX: number;
	scaleY: number;
	select(x?: number, y?: number, width?: number, height?: number): void;
};

const getFrame = (): HTMLElement => document.getElementById('autoTile-selectNode') as HTMLElement;

const getCanvas = (): HTMLCanvasElement =>
	document.getElementById('autoTile-selectNode-canvas') as HTMLCanvasElement;

const getMarquee = (): MarqueeEl =>
	document.getElementById('autoTile-selectNode-marquee') as unknown as MarqueeEl;

const nodes = [{ frames: [0] }, { frames: [1] }];

const mountAndInit = async (): Promise<{
	wrapper: ReturnType<typeof mount>;
	tileNode: ReturnType<typeof useTileNodeWindow>;
}> => {
	const wrapper = mount(AutoTileSelectNode, { attachTo: document.body });
	await wrapper.vm.$nextTick();
	const screenEl = document.getElementById('autoTile-selectNode-screen') as HTMLElement & {
		scroll: () => void;
	};
	screenEl.scroll = () => undefined;
	const tileNode = useTileNodeWindow();
	tileNode.initialize();
	return { wrapper, tileNode };
};

describe('useTileNodeWindow（自动图块节点选择窗口 composable：open/渲染/交互/closed）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		document.body.innerHTML = '';
		const cursorRegion = document.createElement('div');
		cursorRegion.id = 'cursor-region';
		document.body.appendChild(cursorRegion);
		Window.open = vi.fn();
		Window.close = vi.fn();
		vi.mocked(Palette).explicit = false;
		// 「调色板尚未初始化」，所以在测试里显式置 null —— 与 `palette-selection-render.spec.ts:48`
		// 同一手法（测试夹具用的收窄断言）。
		vi.mocked(Palette).marquee = null as unknown as typeof Palette.marquee;
		vi.mocked(Scene).marquee = sceneMarquee([1]);
		Timer.appendUpdater = vi.fn();
		Timer.removeUpdater = vi.fn();
		vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
			setTransform: vi.fn(),
			clearRect: vi.fn(),
			drawImage: vi.fn()
		} as unknown as CanvasRenderingContext2D);
	});

	it('initialize 绑定 canvas 上下文与 dprchange/scroll/pointerdown 事件', async () => {
		const { wrapper } = await mountAndInit();
		expect(getCanvas().getContext).toBeDefined();
		const context = useTileNodeWindow().context;
		expect(context).toBeTruthy();
		wrapper.unmount();
	});

	it('open 打开窗口、设置框架与画布尺寸并选中首个节点', async () => {
		const { wrapper, tileNode } = await mountAndInit();
		tileNode.open(nodes, document.createElement('img'), 1, 2);
		expect(Window.open).toHaveBeenCalledWith('autoTile-selectNode');
		expect(tileNode.nodes).toBe(nodes);
		expect(tileNode.hframes).toBe(2);
		expect(getFrame().style.width).toBeTruthy();
		expect(getMarquee().visible).toBe(true);
		expect(Timer.appendUpdater).toHaveBeenCalledWith(
			'sharedRendering',
			tileNode.renderingFunction
		);
		wrapper.unmount();
	});

	it('keydown Enter 将选区写入图块并关闭窗口', async () => {
		const { wrapper, tileNode } = await mountAndInit();
		tileNode.open(nodes, document.createElement('img'), 0, 0);
		const tiles = [1];
		vi.mocked(Scene).marquee = sceneMarquee(tiles);
		window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Enter' }));
		expect(tiles[0]).toBe(0);
		expect(Palette.explicit).toBe(true);
		expect(Window.close).toHaveBeenCalledWith('autoTile-selectNode');
		wrapper.unmount();
	});

	it('keydown 方向键移动选区', async () => {
		const { wrapper, tileNode } = await mountAndInit();
		tileNode.open(nodes, document.createElement('img'), 0, 0);
		window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowRight' }));
		expect(getMarquee().x).toBe(1);
		wrapper.unmount();
	});

	it('marqueePointerdown/pointerup 选中图块并写入选区后关闭窗口', async () => {
		const { wrapper, tileNode } = await mountAndInit();
		tileNode.open(nodes, document.createElement('img'), 0, 0);
		const marquee = getMarquee();
		const tiles = [1];
		vi.mocked(Scene).marquee = sceneMarquee(tiles);
		marquee.dispatchEvent(
			new PointerEvent('pointerdown', { bubbles: true, button: 0, pointerId: 7 })
		);
		marquee.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 7 }));
		expect(tiles[0]).toBe(0);
		expect(Palette.explicit).toBe(true);
		expect(Window.close).toHaveBeenCalledWith('autoTile-selectNode');
		wrapper.unmount();
	});

	it('closed 事件清理节点状态并停止渲染', async () => {
		const { wrapper, tileNode } = await mountAndInit();
		tileNode.open(nodes, document.createElement('img'), 0, 0);
		getFrame().dispatchEvent(new CustomEvent('closed'));
		expect(tileNode.nodes).toBeNull();
		expect(tileNode.image).toBeNull();
		expect(getCanvas().width).toBe(0);
		expect(Timer.removeUpdater).toHaveBeenCalledWith(
			'sharedRendering',
			tileNode.renderingFunction
		);
		wrapper.unmount();
	});

	it('dprchange 以当前选区重开窗口', async () => {
		const { wrapper, tileNode } = await mountAndInit();
		tileNode.open(nodes, document.createElement('img'), 0, 0);
		window.dispatchEvent(new Event('dprchange'));
		expect(Window.open).toHaveBeenCalledTimes(2);
		wrapper.unmount();
	});
});
