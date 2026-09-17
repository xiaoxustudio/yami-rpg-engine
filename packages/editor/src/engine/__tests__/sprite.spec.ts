import { screenScrollData } from '../screen-scroll-data';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

vi.mock('@app/utils/element-utils', () => ({
	relate: () => true,
	getRelativeCoords: () => ({ x: 0, y: 0 }),
	hideDragImage: () => {},
	addScrollbars: () => {},
	on: () => {},
	off: () => {},
	addClass: () => {},
	removeClass: () => {},
	hasClass: () => false,
	rect: () => ({ left: 0, top: 0 }),
	clear: () => {},
	write: () => {},
	read: () => 2,
	show: () => {},
	hide: () => {},
	dispatchResizeEvent: () => {}
}));

vi.mock('@app/utils/dom', () => ({
	$: (selector: string) => {
		const el = document.createElement('div');
		el.id = selector.replace('#', '');
		return el;
	}
}));

vi.mock('@app/utils/timer', () => ({
	Timer: class {
		static appendUpdater = vi.fn();
		static removeUpdater = vi.fn();
		start = 0;
		end = 0;
		elapsed = 0;
		add = vi.fn();
		constructor(public opts: any) {}
	}
}));

vi.mock('@app/inspector/inspector', () => ({
	Inspector: { manager: { focusing: false } }
}));

vi.mock('@app/composables/usePointerObjectWindow', () => ({
	Cursor: { open: vi.fn(), close: vi.fn(), region: null }
}));

vi.mock('@app/animation/animation-window', () => ({
	Animation: {
		timelineMarquee: { layer: { sprite: null }, x: 0 },
		player: { textures: {} },
		planToSave: vi.fn(),
		history: { index: 0, length: 0, save: vi.fn() },
		loadFrames: vi.fn(),
		requestRendering: vi.fn(),
		motion: null,
		direction: null
	}
}));

vi.mock('@app/palette/palette', () => ({
	Palette: { updateBackground: vi.fn() }
}));

import { Sprite } from '@app/engine/sprite/sprite.ts';
import '@app/utils/css';

function initSpriteDOM() {
	const body = document.createElement('div');
	body.id = 'sprite-body';
	Object.defineProperty(body, 'clientWidth', { value: 800 });
	Object.defineProperty(body, 'clientHeight', { value: 600 });

	const win = document.createElement('div');
	win.id = 'sprite-frame';

	const canvas = document.createElement('canvas');
	canvas.id = 'sprite-canvas';

	const ctx = new Proxy({} as Record<string, (...args: any[]) => any>, {
		get(_target, prop) {
			if (typeof prop === 'string') {
				return () => {};
			}
			return undefined;
		}
	});

	const info = document.createElement('div');
	info.id = 'sprite-info';

	const slider = document.createElement('div');
	slider.id = 'sprite-zoom';

	const screen = document.createElement('div') as any;
	screen.id = 'sprite-screen';
	screen.scrollLeft = 0;
	screen.scrollTop = 0;
	screenScrollData(screen).rawScrollLeft = 0;
	screenScrollData(screen).rawScrollTop = 0;
	screen.updateScrollbars = vi.fn();
	screen.beginScrolling = vi.fn();
	screen.endScrolling = vi.fn();
	screen.setScroll = vi.fn();
	Object.defineProperty(screen, 'clientWidth', { value: 800 });
	Object.defineProperty(screen, 'clientHeight', { value: 600 });

	const marquee = document.createElement('div') as any;
	marquee.id = 'sprite-marquee';
	marquee.visible = false;
	marquee.x = 0;
	marquee.y = 0;
	marquee.width = 1;
	marquee.height = 1;
	marquee.style = {};
	marquee.select = vi.fn();

	document.body.appendChild(body);
	document.body.appendChild(win);
	document.body.appendChild(canvas);
	document.body.appendChild(info);
	document.body.appendChild(slider);
	document.body.appendChild(screen);
	document.body.appendChild(marquee);

	Sprite.body = body as unknown as (typeof Sprite)['body'];
	Sprite.window = win as unknown as (typeof Sprite)['window'];
	Sprite.canvas = canvas as unknown as (typeof Sprite)['canvas'];
	(Sprite as any).context = ctx;
	Sprite.info = info as unknown as (typeof Sprite)['info'];
	Sprite.slider = slider as unknown as (typeof Sprite)['slider'];
	Sprite.screen = screen as unknown as (typeof Sprite)['screen'];
	Sprite.marquee = marquee as unknown as (typeof Sprite)['marquee'];
	(Sprite as any).zoomTimer = {
		start: 0,
		end: 0,
		elapsed: 0,
		add: vi.fn()
	};
}

describe('Sprite 初始状态', () => {
	beforeEach(() => {
		initSpriteDOM();
		Sprite.state = 'closed';
		Sprite.target = null;
		Sprite.image = null;
		Sprite.symbol = null;
	});

	afterEach(() => {
		document.body.innerHTML = '';
	});

	it('初始 state 为 closed', () => {
		expect(Sprite.state).toBe('closed');
	});

	it('target 初始为 null', () => {
		expect(Sprite.target).toBeNull();
	});

	it('image 初始为 null', () => {
		expect(Sprite.image).toBeNull();
	});
});

describe('Sprite.setZoom', () => {
	beforeEach(() => {
		initSpriteDOM();
		Sprite.state = 'closed';
		Sprite.zoom = null;
		Sprite.scale = 1;
	});

	afterEach(() => {
		document.body.innerHTML = '';
	});

	it('zoom 0 映射到 scale 0.25', () => {
		Sprite.setZoom(0);
		expect(Sprite.zoom).toBe(0);
		expect(Sprite.scale).toBe(0.25);
	});

	it('zoom 1 映射到 scale 0.5', () => {
		Sprite.setZoom(1);
		expect(Sprite.zoom).toBe(1);
		expect(Sprite.scale).toBe(0.5);
	});

	it('zoom 2 映射到 scale 1', () => {
		Sprite.setZoom(2);
		expect(Sprite.zoom).toBe(2);
		expect(Sprite.scale).toBe(1);
	});

	it('zoom 3 映射到 scale 2', () => {
		Sprite.setZoom(3);
		expect(Sprite.zoom).toBe(3);
		expect(Sprite.scale).toBe(2);
	});

	it('zoom 4 映射到 scale 4', () => {
		Sprite.setZoom(4);
		expect(Sprite.zoom).toBe(4);
		expect(Sprite.scale).toBe(4);
	});

	it('无效 zoom 值不改变状态', () => {
		Sprite.setZoom(99);
		expect(Sprite.zoom).toBeNull();
	});

	it('重复设置相同 zoom 不触发更新', () => {
		Sprite.setZoom(2);
		const prev = Sprite.scale;
		Sprite.setZoom(2);
		expect(Sprite.scale).toBe(prev);
	});
});

describe('Sprite 状态机', () => {
	beforeEach(() => {
		initSpriteDOM();
		Sprite.state = 'closed';
		Sprite.target = null;
		Sprite.image = null;
		Sprite.symbol = null;
	});

	afterEach(() => {
		document.body.innerHTML = '';
	});

	it('close 将 state 设为 closed 并清空 target', () => {
		Sprite.state = 'open';
		Sprite.target = { spriteX: 0, spriteY: 0 };
		Sprite.close();
		expect(Sprite.state).toBe('closed');
		expect(Sprite.target).toBeNull();
		expect(Sprite.image).toBeNull();
	});

	it('close 对已关闭状态无副作用', () => {
		Sprite.state = 'closed';
		Sprite.close();
		expect(Sprite.state).toBe('closed');
	});

	it('suspend 将 open 转为 suspended', () => {
		Sprite.state = 'open';
		Sprite.suspend();
		expect(Sprite.state).toBe('suspended');
	});

	it('suspend 对非 open 状态无操作', () => {
		Sprite.state = 'closed';
		Sprite.suspend();
		expect(Sprite.state).toBe('closed');
	});

	it('resume 对非 suspended 状态无操作', () => {
		Sprite.state = 'closed';
		Sprite.resume();
		expect(Sprite.state).toBe('closed');
	});
});

describe('Sprite.themechange', () => {
	beforeEach(() => {
		initSpriteDOM();
		Sprite.state = 'closed';
		Sprite.showGrid = true;
	});

	afterEach(() => {
		document.body.innerHTML = '';
	});

	it('light 主题设置深色网格', () => {
		Sprite.themechange({ value: 'light' } as any);
		expect(Sprite.gridColor).toBe('rgba(0, 0, 0, 0.5)');
	});

	it('dark 主题设置浅色网格', () => {
		Sprite.themechange({ value: 'dark' } as any);
		expect(Sprite.gridColor).toBe('rgba(255, 255, 255, 0.5)');
	});
});

describe('Sprite.updateTargetInfo', () => {
	beforeEach(() => {
		initSpriteDOM();
	});

	afterEach(() => {
		document.body.innerHTML = '';
	});

	it('无 target 时不更新 info', () => {
		Sprite.target = null;
		Sprite.updateTargetInfo();
		expect(Sprite.info.textContent).toBe('');
	});

	it('有 target 时写入坐标与尺寸', () => {
		Sprite.target = { spriteX: 3, spriteY: 5 };
		Sprite.unitWidth = 32;
		Sprite.unitHeight = 48;
		Sprite.updateTargetInfo();
		expect(Sprite.info.textContent).toBe('3,5 [32x48]');
	});
});

describe('Sprite.saveToProject / loadFromProject', () => {
	beforeEach(() => {
		initSpriteDOM();
	});

	afterEach(() => {
		document.body.innerHTML = '';
	});

	it('saveToProject 写入 zoom', () => {
		Sprite.zoom = 3;
		const project = { sprite: {} as any };
		Sprite.saveToProject(project as any);
		expect(project.sprite.zoom).toBe(3);
	});

	it('loadFromProject 读取 zoom', () => {
		Sprite.zoom = null;
		Sprite.scale = 1;
		const project = { sprite: { zoom: 4 } };
		Sprite.loadFromProject(project as any);
		expect(Sprite.zoom).toBe(4);
	});
});
