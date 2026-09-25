import { describe, expect, it, vi, beforeEach } from 'vitest';
import '@app/utils/math';
import { GL } from '@app/engine/webgl/webgl-init.ts';

vi.mock('@app/utils/element-utils', () => ({
	relate: () => true,
	getRelativeCoords: () => ({ x: 10, y: 20 }),
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
	dispatchResizeEvent: () => {},
	css: () => ({ fontFamily: 'sans-serif' })
}));

vi.mock('@app/data/data-object.ts', () => ({
	Data: {
		config: {
			lightArea: {
				expansionLeft: 0,
				expansionTop: 0,
				expansionRight: 0,
				expansionBottom: 0
			},
			animationArea: {
				expansionLeft: 0,
				expansionTop: 0,
				expansionRight: 0,
				expansionBottom: 0
			}
		},
		manifest: { changed: false },
		tilesets: {}
	}
}));

vi.mock('@app/inspector/inspector', () => ({
	Inspector: { manager: { focusing: false }, uiElement: { target: null, write: vi.fn() } }
}));

const mockTimer = vi.hoisted(() => ({
	appendUpdater: vi.fn(),
	removeUpdater: vi.fn(),
	updaters: { stageRendering: null as any, stageAnimation: null as any }
}));

vi.mock('@app/utils/timer', () => ({
	Timer: mockTimer
}));

vi.mock('@app/palette/palette', () => ({
	Palette: { updateBackground: vi.fn(), explicit: false }
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

vi.mock('@app/engine/ui/ui-singleton', () => {
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
			Button: class {},
			Text: class {},
			Image: class {},
			Container: class {},
			ProgressBar: class {},
			matrix: Matrix,
			matrixs: [Matrix, Matrix, Matrix, Matrix, Matrix],
			width: 800,
			height: 600,
			requestRendering: vi.fn()
		}
	};
});

vi.mock('@app/engine/webgl/webgl-init.ts', () => {
	const mockGL = {
		width: 800,
		height: 600,
		// 真画布（`webgl-init.ts` 里 `document.createElement('canvas')`）：
		// `hasRenderableCanvas` 读的就是它的 width/height。
		canvas: { width: 800, height: 600 },
		flip: -1,
		maxTexSize: 4096,
		arrays: [
			{ float32: new Uint32Array(512 * 512 * 6), uint32: new Uint32Array(512 * 512 * 6) }
		],
		matrix: {
			set: vi.fn().mockReturnThis(),
			multiply: vi.fn().mockReturnThis(),
			project: vi.fn().mockReturnThis(),
			reset: vi.fn().mockReturnThis(),
			translate: vi.fn().mockReturnThis(),
			scale: vi.fn().mockReturnThis()
		},
		reflectedLightMap: {
			scaleX: 1,
			scaleY: 1,
			paddingLeft: 0,
			paddingTop: 0,
			paddingRight: 0,
			paddingBottom: 0,
			expansionLeft: 0,
			expansionTop: 0,
			expansionRight: 0,
			expansionBottom: 0,
			clipX: 0,
			clipY: 0,
			clipWidth: 0,
			clipHeight: 0
		},
		frameBuffer: {},
		binding: null,
		context2d: {
			createImageData: vi.fn(() => ({ data: { buffer: new ArrayBuffer(4), length: 4 } }))
		},
		createTexture: vi.fn(() => ({})),
		deleteTexture: vi.fn(),
		bindTexture: vi.fn(),
		texImage2D: vi.fn(),
		texParameteri: vi.fn(),
		bindFramebuffer: vi.fn(),
		framebufferTexture2D: vi.fn(),
		readPixels: vi.fn(),
		clearColor: vi.fn(),
		clear: vi.fn(),
		bindFBO: vi.fn(),
		unbindFBO: vi.fn(),
		fillRect: vi.fn(),
		drawImage: vi.fn(),
		drawSliceImage: vi.fn(),
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
		updateBlending: vi.fn(),
		activeTexture: vi.fn(),
		bindVertexArray: vi.fn(),
		bufferData: vi.fn(),
		drawElements: vi.fn(),
		updateSamplerNum: vi.fn(),
		textureManager: { map: {} as any, delete: vi.fn() },
		maxTexUnits: 16,
		program: null,
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
		uniformMatrix3fv: vi.fn(),
		uniform1i: vi.fn(),
		uniform4f: vi.fn(),
		STREAM_DRAW: 0x88e0,
		ARRAY_BUFFER: 0x8892,
		TEXTURE_2D: 0x0de1,
		TEXTURE0: 0x84c0,
		DEPTH_TEST: 0x0b71,
		COLOR_BUFFER_BIT: 0x4000,
		SCISSOR_TEST: 0x0c11,
		FRAMEBUFFER: 0x8d40,
		COLOR_ATTACHMENT0: 0x8ce0,
		RGBA: 0x1908,
		UNSIGNED_BYTE: 0x1401,
		LINE_LOOP: 0x0002,
		TRIANGLES: 0x0004,
		TRIANGLE_FAN: 0x0006,
		UNSIGNED_INT: 0x1405,
		NEAREST: 0x2600,
		CLAMP_TO_EDGE: 0x812f,
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

const { Scene } = vi.hoisted(() => ({
	Scene: {
		state: 'open',
		layer: 'tilemap',
		scale: 1,
		scaleX: 1,
		scaleY: 1,
		scrollLeft: 0,
		scrollTop: 0,
		scrollRight: 1000,
		scrollBottom: 800,
		scrollCenterX: 500,
		scrollCenterY: 400,
		lightLeft: 0,
		lightTop: 0,
		lightRight: 1000,
		lightBottom: 800,
		tileWidth: 32,
		tileHeight: 32,
		scaledTileWidth: 32,
		scaledTileHeight: 32,
		paddingLeft: 0,
		paddingTop: 0,
		centerOffsetX: 0,
		centerOffsetY: 0,
		outerWidth: 1600,
		outerHeight: 1200,
		width: 50,
		height: 40,
		meta: { x: 10, y: 5 },
		screen: {
			scrollLeft: 0,
			scrollTop: 0,
			rawScrollLeft: 0,
			rawScrollTop: 0,
			clientWidth: 800,
			clientHeight: 600,
			updateScrollbars: vi.fn(),
			setScroll: vi.fn()
		},
		marquee: {
			visible: false,
			x: 0,
			y: 0,
			width: 0,
			height: 0,
			offsetX: 0,
			offsetY: 0,
			tiles: [] as number[],
			terrain: 0,
			tilesetMap: {},
			saveData: {} as Record<string, any>,
			key: 'default',
			backgroundColorNormal: '#000',
			borderColorNormal: '#fff',
			backgroundColorRect: '#000',
			borderColorRect: '#fff',
			backgroundColorCopy: '#000',
			borderColorCopy: '#fff',
			previewTiles: false,
			save: vi.fn(),
			restore: vi.fn(),
			select: vi.fn(),
			getTiles: vi.fn(() => []),
			pointerevent: null as any,
			backgroundColor: '#000',
			borderColor: '#fff',
			info: { textContent: '' }
		} as any,
		matrix: {
			reset: vi.fn().mockReturnThis(),
			scale: vi.fn().mockReturnThis(),
			translate: vi.fn().mockReturnThis()
		},
		info: { textContent: '' },
		tilemap: null as any,
		terrains: new Uint8Array(0),
		actors: [] as any[],
		animations: [] as any[],
		regions: [] as any[],
		lights: [] as any[],
		particles: [] as any[],
		foregrounds: [] as any[],
		doodads: [] as any[],
		backgrounds: [] as any[],
		parallaxes: [] as any[],
		activeTilemapId: -1,
		showAnimation: false,
		showLight: false,
		brush: 'pencil',
		shiftKey: false,
		patternOriginX: 0,
		patternOriginY: 0,
		sharedPoint: { set: vi.fn((x: number, y: number) => ({ x, y })) },
		requestRendering: vi.fn(),
		planToSave: vi.fn(),
		getConvertedCoords: vi.fn((t: any) => ({ x: t.x * 32, y: t.y * 32 })),
		getParallaxAnchor: vi.fn((t: any) => ({ x: t.x * 32, y: t.y * 32 })),
		getGridContext: vi.fn(() => ({ width: 50, height: 40, offsetX: 0, offsetY: 0 })),
		selectRegion: vi.fn(() => null),
		selectLight: vi.fn(() => null),
		selectParticleEmitter: vi.fn(() => null),
		selectSortedLayer: vi.fn(() => null),
		setRectWireframeVertices: vi.fn(),
		setTile: vi.fn(),
		setTerrain: vi.fn(),
		setTileFrame: vi.fn(),
		restoreMapData: vi.fn(),
		updateParallaxes: vi.fn(),
		updateAnimations: vi.fn(),
		updateAnimation: vi.fn(),
		updateParticles: vi.fn(),
		drawScene: vi.fn(),
		player: { update: vi.fn() },
		animationElapsed: 0,
		animationFrame: 0,
		animationInterval: 16,
		renderingFunction: vi.fn()
	}
}));

vi.mock('@app/scene/scene-window.ts', () => ({ Scene }));

import { SceneCameraEngine } from '@app/engine/scene/scene-camera-engine.ts';
import { SceneSelectionEngine } from '@app/engine/scene/scene-selection-engine.ts';
import { SceneMarqueeEngine } from '@app/engine/scene/scene-marquee-engine.ts';
import { SceneAnimateEngine } from '@app/engine/scene/scene-animate-engine.ts';
import { elementDataOf } from '@ui-kit';

// P4b：选框元素的 `key` 是元素数据（WeakMap）——夹具里的 plain marquee 也按同一份存储读写，
// 否则 `switch` 写进去的 key 在这里读不到（`visible` 等是组件实例属性，不走元素数据）。
const marqueeData = (el: unknown): { key: string | null } =>
	elementDataOf<{ key: string | null }>(el);

describe('SceneCameraEngine.getConvertedCoords', () => {
	it('将图块坐标转换为像素坐标', () => {
		const result = SceneCameraEngine.getConvertedCoords({ x: 5, y: 3 });
		expect(result.x).toBe(160);
		expect(result.y).toBe(96);
	});

	it('零坐标映射为零像素', () => {
		const result = SceneCameraEngine.getConvertedCoords({ x: 0, y: 0 });
		expect(result.x).toBe(0);
		expect(result.y).toBe(0);
	});
});

describe('SceneCameraEngine.rasterizeScrollPosition', () => {
	beforeEach(() => {
		Scene.scaleX = 1;
		Scene.scaleY = 1;
		Scene.scrollLeft = 100;
		Scene.scrollTop = 50;
		Scene.scrollRight = 900;
		Scene.scrollBottom = 650;
	});

	it('零偏移时光栅化结果等于当前滚动值', () => {
		const result = SceneCameraEngine.rasterizeScrollPosition.call(Scene, 0, 0);
		expect(result.left).toBeCloseTo(100);
		expect(result.top).toBeCloseTo(50);
	});

	it('偏移量被正确应用后光栅化', () => {
		const result = SceneCameraEngine.rasterizeScrollPosition.call(Scene, 10, 20);
		expect(result.left).toBeCloseTo(110);
		expect(result.top).toBeCloseTo(70);
	});
});

describe('SceneSelectionEngine.selectObject', () => {
	beforeEach(() => {
		Scene.actors = [];
		Scene.animations = [];
		Scene.regions = [];
		Scene.lights = [];
		Scene.particles = [];
		Scene.foregrounds = [];
		Scene.doodads = [];
		Scene.backgrounds = [];
		Scene.showLight = false;
	});

	it('空场景返回 null', () => {
		const target = SceneSelectionEngine.selectObject!.call(Scene, 10, 10);
		expect(target).toBeNull();
	});

	it('选中未隐藏且未锁定的对象', () => {
		Scene.actors = [{ x: 5, y: 5, data: { size: 4 } }];
		const target = SceneSelectionEngine.selectObject!.call(Scene, 5, 5);
		expect(target).toEqual(Scene.actors[0]);
	});

	it('跳过隐藏的对象', () => {
		Scene.actors = [{ x: 5, y: 5, hidden: true, data: { size: 4 } }];
		const target = SceneSelectionEngine.selectObject!.call(Scene, 5, 5);
		expect(target).toBeNull();
	});

	it('跳过锁定的对象', () => {
		Scene.actors = [{ x: 5, y: 5, locked: true, data: { size: 4 } }];
		const target = SceneSelectionEngine.selectObject!.call(Scene, 5, 5);
		expect(target).toBeNull();
	});
});

describe('SceneSelectionEngine.selectRegion', () => {
	beforeEach(() => {
		Scene.regions = [];
	});

	it('空列表返回 null', () => {
		const target = SceneSelectionEngine.selectRegion!.call(Scene, 10, 10);
		expect(target).toBeNull();
	});

	it('选中包含点击点的区域', () => {
		Scene.regions = [{ x: 10, y: 10, width: 20, height: 20 }];
		const target = SceneSelectionEngine.selectRegion!.call(Scene, 10, 10);
		expect(target).toEqual(Scene.regions[0]);
	});

	it('跳过隐藏的区域', () => {
		Scene.regions = [{ x: 10, y: 10, width: 20, height: 20, hidden: true }];
		const target = SceneSelectionEngine.selectRegion!.call(Scene, 10, 10);
		expect(target).toBeNull();
	});
});

describe('SceneMarqueeEngine', () => {
	beforeEach(() => {
		Scene.marquee.visible = false;
		Scene.marquee.x = 0;
		Scene.marquee.y = 0;
		Scene.marquee.width = 0;
		Scene.marquee.height = 0;
		Scene.marquee.offsetX = 0;
		Scene.marquee.offsetY = 0;
		Scene.marquee.saveData = {};
		marqueeData(Scene.marquee).key = 'default';
		Scene.requestRendering.mockClear();
	});

	it('select 设置选框属性并标记 visible', () => {
		SceneMarqueeEngine.select.call(Scene.marquee, 5, 10, 20, 30);
		expect(Scene.marquee.x).toBe(5);
		expect(Scene.marquee.y).toBe(10);
		expect(Scene.marquee.width).toBe(20);
		expect(Scene.marquee.height).toBe(30);
		expect(Scene.marquee.visible).toBe(true);
	});

	it('clear 隐藏选框', () => {
		Scene.marquee.visible = true;
		Scene.marquee.info = Scene.info;
		Scene.info.textContent = '';
		SceneMarqueeEngine.clear.call(Scene.marquee);
		expect(Scene.marquee.visible).toBe(false);
	});

	it('switch 保存并恢复不同 key 的状态', () => {
		marqueeData(Scene.marquee).key = 'default';
		SceneMarqueeEngine.switch.call(Scene.marquee, 'tile');
		expect(marqueeData(Scene.marquee).key).toBe('tile');
		expect(Scene.marquee.save).toHaveBeenCalled();
		expect(Scene.marquee.restore).toHaveBeenCalledWith('tile');
	});

	it('selectInPencilMode 设置铅笔模式颜色', () => {
		SceneMarqueeEngine.selectInPencilMode.call(Scene.marquee, 0, 0, 2, 2);
		expect(Scene.marquee.backgroundColor).toBe(Scene.marquee.backgroundColorNormal);
		expect(Scene.marquee.borderColor).toBe(Scene.marquee.borderColorNormal);
		expect(Scene.marquee.previewTiles).toBe(true);
	});
});

describe('SceneAnimateEngine', () => {
	beforeEach(() => {
		Scene.state = 'open';
		Scene.showAnimation = true;
		Scene.animationElapsed = 0;
		Scene.animationFrame = 0;
		mockTimer.appendUpdater.mockClear();
		mockTimer.removeUpdater.mockClear();
	});

	it('requestRendering 追加 stageRendering', () => {
		SceneAnimateEngine.requestRendering!.call(Scene);
		expect(mockTimer.appendUpdater).toHaveBeenCalledWith(
			'stageRendering',
			Scene.renderingFunction
		);
	});

	it('stopRendering 移除 stageRendering', () => {
		SceneAnimateEngine.stopRendering!.call(Scene);
		expect(mockTimer.removeUpdater).toHaveBeenCalledWith(
			'stageRendering',
			Scene.renderingFunction
		);
	});

	it('requestAnimation 在 open+showAnimation 时追加', () => {
		SceneAnimateEngine.requestAnimation!.call(Scene);
		expect(mockTimer.appendUpdater).toHaveBeenCalledWith(
			'stageAnimation',
			Scene.updateAnimation
		);
	});

	it('stopAnimation 移除 stageAnimation', () => {
		SceneAnimateEngine.stopAnimation!.call(Scene);
		expect(mockTimer.removeUpdater).toHaveBeenCalledWith(
			'stageAnimation',
			Scene.updateAnimation
		);
	});

	it('requestRendering 不在 closed 状态追加', () => {
		Scene.state = 'closed';
		SceneAnimateEngine.requestRendering!.call(Scene);
		expect(mockTimer.appendUpdater).not.toHaveBeenCalled();
	});

	/**
	 * `#scene-screen` 是 `<div class="box">`（`LayoutPanel.vue`），div 没有 `width`/`height`
	 * 属性；本文件 mock 的 `Scene.screen` 正是这个形态（只有 clientWidth/clientHeight）。
	 * 旧实现读 `Scene.screen.width/height` ⇒ `undefined !== 0` 恒真 ⇒ 守卫失效、0×0 照画。
	 */
	it('updateAnimation 在真画布 0×0 时跳过绘制', () => {
		const drawScene = Scene.drawScene;
		drawScene.mockClear();
		mockTimer.updaters.stageRendering = null; // ≠ Scene.renderingFunction，走绘制分支

		GL.canvas.width = 0;
		GL.canvas.height = 0;
		SceneAnimateEngine.updateAnimation!.call(Scene, 0);
		expect(drawScene).not.toHaveBeenCalled();

		GL.canvas.width = 800;
		GL.canvas.height = 600;
		SceneAnimateEngine.updateAnimation!.call(Scene, 0);
		expect(drawScene).toHaveBeenCalledTimes(1);
	});
});
