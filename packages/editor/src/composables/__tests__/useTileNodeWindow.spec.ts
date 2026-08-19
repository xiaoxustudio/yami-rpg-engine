import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import AutoTileSelectNode from '@app/components/tools/AutoTileSelectNode.vue';
import { useTileNodeWindow } from '@app/composables/useTileNodeWindow';
import { Window } from '@app/legacy/tools/window-object.ts';
import { Palette } from '@app/legacy/palette/palette.ts';
import { Scene } from '@app/legacy/scene/scene-window.ts';
import { Timer } from '@app/utils/timer';
import '@app/utils/math';

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ getLabel: () => '', syncState: vi.fn() })
}));

vi.mock('@app/legacy/palette/palette.ts', () => ({
	Palette: {
		tileset: { tileWidth: 32, tileHeight: 32 },
		updateBackground: vi.fn(),
		explicit: false,
		marquee: null
	}
}));

vi.mock('@app/legacy/scene/scene-window.ts', () => ({
	Scene: {
		marquee: {
			key: 'tile',
			tiles: [1],
			saveData: {}
		}
	}
}));

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
		vi.mocked(Palette).marquee = null;
		vi.mocked(Scene).marquee = {
			key: 'tile',
			tiles: [1],
			saveData: {}
		} as unknown as typeof Scene.marquee;
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
		vi.mocked(Scene).marquee = {
			key: 'tile',
			tiles,
			saveData: {}
		} as unknown as typeof Scene.marquee;
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
		vi.mocked(Scene).marquee = {
			key: 'tile',
			tiles,
			saveData: {}
		} as unknown as typeof Scene.marquee;
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

	it('legacy TileNode 入口 initialize/open 转发 composable', async () => {
		const { TileNode: TileNodeController } =
			await import('@app/legacy/palette/tile-node-window.ts');
		const { wrapper } = await mountAndInit();
		TileNodeController.open!(nodes, document.createElement('img'), 0, 0);
		expect(Window.open).toHaveBeenCalledWith('autoTile-selectNode');
		expect(useTileNodeWindow().nodes).toBe(nodes);
		wrapper.unmount();
	});
});
