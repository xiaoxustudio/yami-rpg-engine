import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import '@app/utils/math';
import '@app/utils/object';

const { layoutMock, titleMock } = vi.hoisted(() => ({
	layoutMock: {
		disableFocusableElements: vi.fn(),
		enableFocusableElements: vi.fn()
	},
	titleMock: {
		pointerenter: vi.fn(),
		pointermove: vi.fn()
	}
}));
vi.mock('@app/tools/window-cluster', () => ({
	Layout: layoutMock,
	Title: titleMock
}));

import AutoTileWindow from '@app/components/tools/AutoTile.vue';
import Confirmation from '@app/components/tools/Confirmation.vue';
import { AutoTile } from '@app/palette/auto-tile.ts';
import { Window } from '@app/tools/window-object.ts';
import { primeWindows } from '@app/tools/window-registry';
import { getAutoTileStore } from '@app/stores/auto-tile';
import { getPaletteStore } from '@app/stores/palette';
import { Data } from '@app/data/data-object.ts';

vi.mock('@app/utils/css', async (importOriginal) => ({
	...(await importOriginal<typeof import('@app/utils/css')>()),
	getDevicePixelContentBoxSize: () => ({
		width: 128,
		height: 128,
		inlineSize: 128,
		blockSize: 128
	})
}));

vi.mock('@app/scene/scene-window.ts', () => ({
	Scene: {
		requestRendering: vi.fn(),
		marquee: { style: {}, key: 'tile', tiles: [1], saveData: { tile: { tiles: [1] } } }
	}
}));

vi.mock('@app/file/file-system-core.ts', () => ({
	File: {
		get: vi.fn(() => Promise.resolve(null)),
		planToSave: vi.fn()
	}
}));

const templates = [
	{ id: 't1', name: 'template-1', cover: 0, nodes: [{ rule: 0, frames: [0] }] },
	{ id: 't2', name: 'template-2', cover: 0, nodes: [{ rule: 0, frames: [0] }] }
];

const autoFrame = (): HTMLElement => document.getElementById('autoTile') as HTMLElement;
const confirmFrame = (): HTMLElement | null => document.getElementById('confirmation');
const pressEscape = () =>
	window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Escape', cancelable: true }));
const clickTitleClose = (frame: HTMLElement) => {
	const close = frame.querySelector(':scope > .title-bar > .close') as HTMLElement;
	close.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
};

describe('AutoTile 窗口关闭链（用户反馈：关闭后锁死 / ESC 复现 / 二次关闭恢复）', () => {
	let wrappers: Array<ReturnType<typeof mount>> = [];

	beforeEach(() => {
		primeWindows({ Layout: layoutMock, Title: titleMock });
		const ambient = document.getElementById('window-ambient') as HTMLElement & {
			update?: () => void;
		};
		ambient.update = ambient.update ?? Window.ambient.update;
		document.body.innerHTML = '';
		document.body.appendChild(ambient);
		const title = document.createElement('div');
		title.id = 'title';
		document.body.appendChild(title);
		vi.stubGlobal('scrollTo', vi.fn());
		// P4d：`getDevicePixelContentBoxSize` 已是 `@app/utils/css` 的命名导出（模块 mock 见文件顶部）
		Data.autotiles = templates;
		Data.createGUIDMap = vi.fn();
		Data.manifest = { project: { autotiles: 'auto.json' } };
		getPaletteStore().tileset = {
			type: 'auto',
			width: 4,
			height: 4,
			tileWidth: 32,
			tileHeight: 32,
			tiles: Array.from({ length: 16 }, () => 0),
			priorities: Array.from({ length: 16 }, () => 0),
			terrains: Array.from({ length: 16 }, () => 0),
			tags: Array.from({ length: 16 }, () => 0)
		};
		getAutoTileStore().changed = false;
		getAutoTileStore().templates = null;
		AutoTile.canvas = null;
		AutoTile.templateList = null;
		AutoTile.nodeList = null;
		AutoTile.frameList = null;
		AutoTile.nodes = null;
		AutoTile.image = null;
		wrappers.push(mount(AutoTileWindow, { attachTo: document.body }));
		wrappers.push(mount(Confirmation, { attachTo: document.body }));
	});

	it('基线：open 后 changed=false，X 关闭干净利落（栈清空 + 模态恢复）', async () => {
		AutoTile.open!({ template: 't1', image: '', x: 0, y: 0 });
		await nextTick();
		expect(autoFrame().classList.contains('open')).toBe(true);
		expect(document.body.style.pointerEvents).toBe('none');
		expect(getAutoTileStore().changed).toBe(false);

		clickTitleClose(autoFrame());
		await nextTick();
		expect(Window.frames).toHaveLength(0);
		expect(autoFrame().classList.contains('open')).toBe(false);
		expect(document.body.style.pointerEvents).toBe('inherit');
	});

	it('open 重置 store.changed（修复跨会话残留导致的意外确认框）', async () => {
		getAutoTileStore().changed = true;
		AutoTile.open!({ template: 't1', image: '', x: 0, y: 0 });
		await nextTick();
		expect(getAutoTileStore().changed).toBe(false);
	});

	it('监听注册延迟（initialize 早退后 open 补注册）：X 关闭仍能触发未保存确认', async () => {
		AutoTile.open!({ template: 't1', image: '', x: 0, y: 0 });
		await nextTick();
		getAutoTileStore().changed = true;

		clickTitleClose(autoFrame());
		await nextTick();

		expect(autoFrame().classList.contains('open')).toBe(true);
		expect(confirmFrame()?.classList.contains('open')).toBe(true);
		expect(Window.frames.map((f) => f.id)).toEqual(['autoTile', 'confirmation']);
		expect(document.body.style.pointerEvents).toBe('none');
	});

	it('changed=true 且监听已注册时 X 关闭：窗口保持可见 + confirmation 弹出 + 界面锁死', async () => {
		AutoTile.initialize!();
		AutoTile.open!({ template: 't1', image: '', x: 0, y: 0 });
		await nextTick();
		getAutoTileStore().changed = true;

		clickTitleClose(autoFrame());
		await nextTick();

		expect(autoFrame().classList.contains('open')).toBe(true);
		expect(confirmFrame()?.classList.contains('open')).toBe(true);
		expect(Window.frames.map((f) => f.id)).toEqual(['autoTile', 'confirmation']);
		expect(document.body.style.pointerEvents).toBe('none');

		pressEscape();
		await nextTick();
		expect(confirmFrame()?.classList.contains('open')).toBe(false);
		expect(Window.frames.map((f) => f.id)).toEqual(['autoTile']);
		expect(autoFrame().classList.contains('open')).toBe(true);
		expect(document.body.style.pointerEvents).toBe('none');

		clickTitleClose(autoFrame());
		await nextTick();
		expect(confirmFrame()?.classList.contains('open')).toBe(true);
		expect(Window.frames.map((f) => f.id)).toEqual(['autoTile', 'confirmation']);
		expect(getAutoTileStore().changed).toBe(true);

		const yes = confirmFrame()!.querySelector('#confirmation-button-0') as HTMLElement;
		yes.click();
		await nextTick();
		expect(Window.frames).toHaveLength(0);
		expect(autoFrame().classList.contains('open')).toBe(false);
		expect(document.body.style.pointerEvents).toBe('inherit');
	});

	it('双击第二击落在窗口内规则开关上时 changed 被置位', async () => {
		AutoTile.open!({ template: 't1', image: '', x: 0, y: 0 });
		await nextTick();
		expect(getAutoTileStore().changed).toBe(false);
		AutoTile.node = { rule: 0, frames: [0] };
		const rule = document.getElementById('autoTile-rule-0') as HTMLElement;
		rule.dispatchEvent(
			new PointerEvent('pointerdown', { bubbles: true, button: 0, pointerId: 1 })
		);
		await nextTick();
		expect(getAutoTileStore().changed).toBe(true);
	});

	afterEach(() => {
		for (const wrapper of wrappers) wrapper.unmount();
		wrappers = [];
		Window.frames.length = 0;
		Window.activeElement = null;
		Window.overlapRoot = null;
		Window.positionMode = 'center';
		document.body.style.pointerEvents = '';
		window.removeEventListener('keydown', Window.keydown!);
		vi.unstubAllGlobals();
		vi.restoreAllMocks();
	});
});
