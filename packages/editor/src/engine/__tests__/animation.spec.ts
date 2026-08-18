import { describe, expect, it, vi, afterEach } from 'vitest';
import '@/util/math.ts';

vi.mock('@app/legacy/data/data-object', () => ({
	Data: {
		config: { animation: { frameRate: 60 } },
		particles: {}
	}
}));

vi.mock('@app/legacy/scene/scene-window', () => ({
	Scene: {
		state: 'closed',
		showLight: false,
		requestRendering: vi.fn()
	}
}));

vi.mock('@app/engine/webgl/webgl-init', () => ({
	GL: {
		arrays: {
			0: {
				float32: new Float32Array(65536),
				uint32: new Uint32Array(65536)
			}
		},
		matrix: {
			reset: vi.fn().mockReturnThis(),
			translate: vi.fn().mockReturnThis(),
			rotate: vi.fn().mockReturnThis(),
			scale: vi.fn().mockReturnThis(),
			project: vi.fn().mockReturnThis(),
			multiply: vi.fn().mockReturnThis(),
			set: vi.fn().mockReturnThis(),
			set6f: vi.fn().mockReturnThis(),
			mirrorh: vi.fn().mockReturnThis()
		},
		alpha: 1,
		blend: 'normal',
		width: 800,
		height: 600,
		flip: false,
		batchRenderer: {
			draw: vi.fn(),
			setAttrSize: vi.fn(),
			push: vi.fn(),
			response: [0, 0]
		},
		spriteProgram: {
			use: vi.fn(() => ({
				vao: {},
				u_Matrix: {},
				u_Tint: {}
			}))
		},
		graphicProgram: {
			use: vi.fn(() => ({
				vao: { a10: {} },
				u_Matrix: {},
				u_Color: {},
				a_Color: {}
			}))
		},
		dashedLineProgram: {
			use: vi.fn(() => ({
				vao: {},
				u_Matrix: {},
				u_Color: {}
			}))
		},
		imageProgram: {
			use: vi.fn(() => ({
				vao: {},
				u_Matrix: {},
				u_LightMode: {},
				u_ColorMode: {},
				u_Tint: {}
			}))
		},
		bindVertexArray: vi.fn(),
		bindTexture: vi.fn(),
		bufferData: vi.fn(),
		drawElements: vi.fn(),
		drawArrays: vi.fn(),
		clear: vi.fn(),
		clearColor: vi.fn(),
		COLOR_BUFFER_BIT: 16384,
		LINES: 1,
		TRIANGLES: 4,
		TRIANGLE_FAN: 6,
		TRIANGLE_STRIP: 5,
		STREAM_DRAW: 35040,
		UNSIGNED_INT: 5125,
		ARRAY_BUFFER: 34962,
		TEXTURE_2D: 3553
	}
}));

vi.mock('@app/legacy/ui/ui-window', () => ({
	UI: {
		controlPointTexture: null,
		requestRendering: vi.fn()
	}
}));

vi.mock('@app/legacy/animation/animation-window', () => ({
	Animation: {
		Player: null as any,
		matrix: {
			set: vi.fn().mockReturnThis(),
			set6f: vi.fn().mockReturnThis(),
			mirrorh: vi.fn().mockReturnThis()
		},
		timelineMarquee: { layer: { sprite: null }, x: 0 },
		player: { textures: {}, contexts: [], emitters: [], onionskin: { prev: [], next: [] } },
		planToSave: vi.fn(),
		history: { index: 0, length: 0, save: vi.fn() },
		loadFrames: vi.fn(),
		requestRendering: vi.fn(),
		motion: null,
		direction: null,
		scrollLeft: 0,
		scrollTop: 0,
		scrollRight: 800,
		scrollBottom: 600,
		centerX: 0,
		centerY: 0,
		scale: 1,
		scaleX: 1,
		scaleY: 1,
		outerWidth: 800,
		outerHeight: 600,
		centerOffsetX: 0,
		centerOffsetY: 0,
		background: { getGLRGBA: () => [0, 0, 0, 1] },
		layers: null,
		opacity: 1,
		hover: null,
		targetContext: null,
		controlPoints: { rectList: [] },
		animIndex: 0,
		particleUpdating: false,
		stop: vi.fn(),
		resetSoundContexts: vi.fn(),
		emitParticles: vi.fn(),
		updateSoundContexts: vi.fn(),
		updateParticles: vi.fn(),
		updateControlPoints: vi.fn(() => false),
		getAnimationRange: vi.fn(() => ({ start: 0, end: 100 })),
		drawBackground: vi.fn(),
		drawOnionskins: vi.fn(),
		drawSpriteLayers: vi.fn(),
		drawBackParticles: vi.fn(),
		drawFrontParticles: vi.fn(),
		drawCoordinateAxes: vi.fn(),
		drawEmitters: vi.fn(),
		drawJointNodes: vi.fn(),
		drawJointArrows: vi.fn(),
		drawJointSpinner: vi.fn(),
		drawHoverWireframe: vi.fn(),
		drawTargetWireframe: vi.fn(),
		drawTargetAnchor: vi.fn(),
		drawSpriteControlPoints: vi.fn(),
		drawSpriteWireframe: vi.fn(),
		drawEmitterWireframe: vi.fn()
	}
}));

vi.mock('@app/legacy/data/transition-window', () => ({
	Easing: {
		get: vi.fn(() => (t: number) => t)
	}
}));

vi.mock('@app/legacy/particle/particle-window', () => ({
	Particle: {
		Emitter: vi.fn(() => ({
			destroy: vi.fn(),
			isEmpty: vi.fn(() => true),
			emitParticles: vi.fn(),
			updateParticles: vi.fn(() => 0),
			clear: vi.fn(),
			disabled: false,
			scale: 1,
			speed: 1,
			opacity: 1,
			angle: 0,
			layer: { order: 'before' },
			matrix: null,
			hasArea: false
		}))
	}
}));

vi.mock('@app/engine/webgl/image-texture', () => ({
	ImageTexture: class {
		complete = true;
		width = 32;
		height = 32;
		base = { guid: '', glTexture: {}, index: 0, width: 32, height: 32 };
		on = vi.fn();
		destroy = vi.fn();
		constructor(public guid: string) {}
	}
}));

vi.mock('@app/legacy/util/timer', () => ({
	Timer: {
		appendUpdater: vi.fn(),
		removeUpdater: vi.fn()
	}
}));

vi.mock('@app/stores/animation', () => ({
	getAnimationStore: vi.fn(() => ({
		state: 'open',
		mirror: false,
		showOnionskin: false,
		showMark: true,
		playing: true,
		loop: true,
		speed: 1,
		target: null
	}))
}));

import { Animation } from '@app/legacy/animation/animation-window.ts';
import '@app/engine/animation/animation-player.ts';

function createMockAnimationData(): any {
	return {
		sprites: [],
		motions: []
	};
}

describe('AnimationPlayer 构造函数', () => {
	it('初始化默认属性', () => {
		const player = new Animation.Player(createMockAnimationData());
		expect(player.index).toBe(0);
		expect(player.length).toBe(0);
		expect(player.speed).toBe(1);
		expect(player.scale).toBe(1);
		expect(player.opacity).toBe(1);
		expect(player.angle).toBe(0);
		expect(player.direction).toBe(-1);
		expect(player.mirror).toBe(false);
		expect(player.motion).toBeNull();
		expect(player.layers).toBeNull();
		expect(player.isUIComponent).toBe(false);
	});

	it('加载 motions 和 sprites', () => {
		const data = {
			sprites: [{ id: 's1', hframes: 4, vframes: 1, image: 'img1' }],
			motions: [{ id: 'm1', mode: '1-dir', dirCases: [] }]
		};
		const player = new Animation.Player(data);
		expect(player.sprites['s1']).toBeDefined();
		expect(player.motions['m1']).toBeDefined();
		expect(player.images['s1']).toBe('img1');
	});
});

describe('AnimationPlayer.setMotion', () => {
	it('设置有效 motion 返回 true', () => {
		const data = {
			sprites: [],
			motions: [{ id: 'm1', mode: '1-dir', dirCases: [{ loaded: undefined, layers: [] }] }]
		};
		const player = new Animation.Player(data);
		const result = player.setMotion('m1');
		expect(result).toBe(true);
		expect(player.motion).toBeDefined();
	});

	it('设置不存在的 motion 返回 false', () => {
		const player = new Animation.Player(createMockAnimationData());
		const result = player.setMotion('nonexistent');
		expect(result).toBe(false);
	});

	it('重复设置相同 motion 返回 false', () => {
		const data = {
			sprites: [],
			motions: [{ id: 'm1', mode: '1-dir', dirCases: [{ loaded: undefined, layers: [] }] }]
		};
		const player = new Animation.Player(data);
		player.setMotion('m1');
		const result = player.setMotion('m1');
		expect(result).toBe(false);
	});
});

describe('AnimationPlayer.setAngle / setDirection', () => {
	it('setAngle 更新 angle 并可能改变 direction', () => {
		const data = {
			sprites: [],
			motions: [
				{
					id: 'm1',
					mode: '4-dir',
					dirCases: [
						{ loaded: undefined, layers: [] },
						{ loaded: undefined, layers: [] },
						{ loaded: undefined, layers: [] },
						{ loaded: undefined, layers: [] }
					]
				}
			]
		};
		const player = new Animation.Player(data);
		player.setMotion('m1');
		player.setAngle(0);
		expect(player.angle).toBe(0);
	});

	it('setDirection 有效方向返回 true', () => {
		const data = {
			sprites: [],
			motions: [
				{
					id: 'm1',
					mode: '4-dir',
					dirCases: [
						{ loaded: undefined, layers: [] },
						{ loaded: undefined, layers: [] },
						{ loaded: undefined, layers: [] },
						{ loaded: undefined, layers: [] }
					]
				}
			]
		};
		const player = new Animation.Player(data);
		player.setMotion('m1');
		const changed = player.setDirection(1);
		expect(changed).toBe(true);
		expect(player.direction).toBe(1);
	});

	it('setDirection 无效方向返回 false', () => {
		const data = {
			sprites: [],
			motions: [{ id: 'm1', mode: '1-dir', dirCases: [{ loaded: undefined, layers: [] }] }]
		};
		const player = new Animation.Player(data);
		player.setMotion('m1');
		const changed = player.setDirection(5);
		expect(changed).toBe(false);
	});

	it('设置相同 direction 返回 false', () => {
		const data = {
			sprites: [],
			motions: [{ id: 'm1', mode: '1-dir', dirCases: [{ loaded: undefined, layers: [] }] }]
		};
		const player = new Animation.Player(data);
		player.setMotion('m1');
		player.setDirection(0);
		const changed = player.setDirection(0);
		expect(changed).toBe(false);
	});
});

describe('AnimationPlayer.goto / restart / reset', () => {
	it('goto 限制在 [0, length-1] 范围', () => {
		const player = new Animation.Player(createMockAnimationData());
		(player as any).length = 10;
		player.goto(20);
		expect(player.index).toBe(9);
		player.goto(-5);
		expect(player.index).toBe(0);
	});

	it('goto 到前面时增加 cycleIndex', () => {
		const player = new Animation.Player(createMockAnimationData());
		(player as any).length = 10;
		(player as any).cycleIndex = 0;
		player.goto(8);
		expect(player.index).toBe(8);
		expect(player.cycleIndex).toBe(0);
		player.goto(3);
		expect(player.cycleIndex).toBe(1);
	});

	it('restart 重置 index 为 0', () => {
		const player = new Animation.Player(createMockAnimationData());
		(player as any).index = 5;
		player.restart();
		expect(player.index).toBe(0);
	});

	it('reset 清空所有状态', () => {
		const player = new Animation.Player(createMockAnimationData());
		(player as any).index = 5;
		(player as any).length = 10;
		player.reset();
		expect(player.index).toBe(0);
		expect(player.length).toBe(0);
		expect(player.end).toBe(0);
		expect(player.motion).toBeNull();
	});
});

describe('AnimationPlayer.update', () => {
	it('length 为 0 时不更新 index', () => {
		const player = new Animation.Player(createMockAnimationData());
		(player as any).length = 0;
		player.update(100);
		expect(player.index).toBe(0);
	});

	it('循环动画 index 超过 end 时回到 loopStart', () => {
		const data = {
			sprites: [],
			motions: [
				{
					id: 'm1',
					mode: '1-dir',
					loop: true,
					loopStart: 0,
					skip: false,
					dirCases: [{ loaded: undefined, layers: [{ frames: [{ start: 0, end: 20 }] }] }]
				}
			]
		};
		const player = new Animation.Player(data);
		player.setMotion('m1');
		(Animation.Player as any).step = 16.667;
		(player as any).index = 18;
		(player as any).end = 20;
		(player as any).loopStart = 0;
		player.update(50);
		expect(player.index).toBeLessThan(20);
	});

	it('非循环动画 index 到达 end 时停在 end-1', () => {
		const data = {
			sprites: [],
			motions: [
				{
					id: 'm1',
					mode: '1-dir',
					loop: false,
					loopStart: 0,
					skip: false,
					dirCases: [{ loaded: undefined, layers: [{ frames: [{ start: 0, end: 10 }] }] }]
				}
			]
		};
		const player = new Animation.Player(data);
		player.setMotion('m1');
		(Animation.Player as any).step = 16.667;
		(player as any).index = 8;
		(player as any).end = 10;
		player.update(500);
		expect(player.index).toBe(9);
	});
});

describe('AnimationPlayer.computeLength', () => {
	it('从 contexts 计算 length 和 end', () => {
		const player = new Animation.Player(createMockAnimationData());
		(player as any).motion = { loop: false, skip: false, loopStart: 0 };
		(player as any).contexts = [
			{ layer: { frames: [{ start: 0, end: 30 }] } },
			{ layer: { frames: [{ start: 0, end: 20 }] } }
		];
		(player as any).contexts.count = 2;
		player.computeLength();
		expect(player.length).toBe(30);
		expect(player.end).toBe(30);
	});

	it('循环动画 loopStart 被限制在 lastFrame 内', () => {
		const player = new Animation.Player(createMockAnimationData());
		(player as any).motion = { loop: true, skip: false, loopStart: 100 };
		(player as any).contexts = [{ layer: { frames: [{ start: 0, end: 10 }] } }];
		(player as any).contexts.count = 1;
		player.computeLength();
		expect(player.loopStart).toBe(9);
	});

	it('skip 动画 end 为 lastFrame', () => {
		const player = new Animation.Player(createMockAnimationData());
		(player as any).motion = { loop: true, skip: true, loopStart: 5 };
		(player as any).contexts = [{ layer: { frames: [{ start: 0, end: 20 }] } }];
		(player as any).contexts.count = 1;
		player.computeLength();
		expect(player.end).toBe(19);
	});
});

describe('AnimationPlayer.setScale / setSpeed / setOpacity', () => {
	it('setScale 设置 scale', () => {
		const player = new Animation.Player(createMockAnimationData());
		player.setScale(2);
		expect(player.scale).toBe(2);
	});

	it('setSpeed 设置 speed', () => {
		const player = new Animation.Player(createMockAnimationData());
		player.setSpeed(1.5);
		expect(player.speed).toBe(1.5);
	});

	it('setOpacity 设置 opacity', () => {
		const player = new Animation.Player(createMockAnimationData());
		player.setOpacity(0.5);
		expect(player.opacity).toBe(0.5);
	});
});

describe('AnimationPlayer static updateStep', () => {
	it('根据 animation.frameRate 计算 step', () => {
		(Animation.Player as any).updateStep();
		expect((Animation.Player as any).step).toBeCloseTo(1000 / 60);
	});
});
