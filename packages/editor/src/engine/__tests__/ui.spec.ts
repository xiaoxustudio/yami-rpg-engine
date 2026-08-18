import { describe, expect, it, vi, afterEach } from 'vitest';
import '@/util/math.ts';

if (!Array.prototype.append) {
	(Array.prototype as any).append = function (this: any[], ...items: any[]) {
		this.push(...items);
	};
}
if (!Array.prototype.remove) {
	(Array.prototype as any).remove = function (this: any[], item: any) {
		const idx = this.indexOf(item);
		if (idx !== -1) {
			this.splice(idx, 1);
			return true;
		}
		return false;
	};
}

vi.mock('@app/legacy/inspector/inspector', () => ({
	Inspector: { manager: { focusing: false }, uiElement: { target: null, write: vi.fn() } }
}));

vi.mock('@app/legacy/util/timer', () => ({
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

vi.mock('@app/legacy/util/element-utils', () => ({
	getRelativeCoords: () => ({ x: 0, y: 0 }),
	write: vi.fn(),
	read: vi.fn(() => 2),
	css: () => ({ fontFamily: 'sans-serif' })
}));

vi.mock('@app/legacy/util/dom', () => ({
	$: (selector: string) => {
		const el = document.createElement('div');
		el.id = selector.replace('#', '');
		return el;
	}
}));

vi.mock('@app/legacy/util/safe.ts', () => ({
	getVariable: () => ({ name: 'test' })
}));

vi.mock('@app/legacy/local/local-object.ts', () => ({
	GameLocal: { replace: (v: string) => v }
}));

vi.mock('@app/legacy/printer/printer.ts', () => ({
	Printer: {
		font: 'Arial',
		reset: vi.fn()
	}
}));

vi.mock('@app/legacy/util/color-utils.ts', () => ({
	CSSRGBA: (v: string) => v,
	INTRGBA: () => ({ r: 0, g: 0, b: 0, a: 0 })
}));

const mockGL = vi.hoisted(() => ({
	width: 800,
	height: 600,
	flip: -1,
	maxTexSize: 4096,
	arrays: [{ float32: new Uint32Array(512 * 512 * 6), uint32: new Uint32Array(512 * 512 * 6) }],
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
}));

vi.mock('@app/engine/webgl/webgl-init.ts', () => ({ GL: mockGL }));

vi.mock('@app/stores/ui', () => ({
	getUIStore: () => ({
		zoom: 2,
		state: 'open',
		target: null
	})
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
			Element: class {
				node: any = null;
				x = 0;
				y = 0;
				width = 0;
				height = 0;
				matrix = Matrix;
				opacity = 1;
				transform = {} as any;
				parent: any = null;
				children: any[] = [];
				visible = true;
				connected = false;
				constructor(data: any = {}) {
					this.transform = data.transform ?? {};
					this.visible = !data.hidden;
				}
				draw() {}
				resize() {}
				connect() {
					this.connected = true;
				}
				disconnect() {
					this.connected = false;
				}
				connectChildren() {}
				disconnectChildren() {}
				drawChildren() {}
				resizeChildren() {}
				destroyChildren() {}
				destroy() {}
				appendChild() {}
				appendChildTo() {}
				remove() {}
				calculatePosition() {}
				contains() {
					return false;
				}
				isPointIn() {
					return false;
				}
			},
			Window: class extends class {} {
				constructor() {
					super();
				}
				requestResizing = vi.fn();
			},
			Root: class {},
			Button: null as any,
			Text: null as any,
			Image: null as any,
			Container: null as any,
			ProgressBar: null as any,
			matrix: Matrix,
			matrixs: [Matrix, Matrix, Matrix, Matrix, Matrix],
			width: 800,
			height: 600,
			requestRendering: vi.fn(),
			foreground: { getINTRGBA: vi.fn(() => 0xff000000) },
			prompt: { x: 0, y: 0, width: 0, height: 0 }
		}
	};
});

import '@app/engine/ui/element-base.ts';
import '@app/engine/ui/container-element.ts';
import '@app/engine/ui/button-element.ts';
import '@app/engine/ui/text-element.ts';
import '@app/engine/ui/image-element.ts';
import '@app/engine/ui/progress-bar-element.ts';
import '@app/engine/ui/root-element.ts';
import { UIInstanceList } from '@app/engine/ui/element-instance-list.ts';

const { UI } = await import('@app/legacy/ui/ui-window.ts');

describe('UI.Element 构造与初始状态', () => {
	it('默认参数创建元素', () => {
		const el = new (UI.Element as any)();
		expect(el.x).toBe(0);
		expect(el.y).toBe(0);
		expect(el.width).toBe(0);
		expect(el.height).toBe(0);
		expect(el.opacity).toBe(1);
		expect(el.visible).toBe(true);
		expect(el.connected).toBe(false);
		expect(el.children).toEqual([]);
	});

	it('hidden 参数隐藏元素', () => {
		const el = new (UI.Element as any)({ hidden: true });
		expect(el.visible).toBe(false);
	});

	it('connect/disconnect 切换 connected 标志', () => {
		const el = new (UI.Element as any)();
		expect(el.connected).toBe(false);
		el.connect();
		expect(el.connected).toBe(true);
		el.disconnect();
		expect(el.connected).toBe(false);
	});
});

describe('UI.Container', () => {
	it('draw 调用 drawChildren', () => {
		const container = new (UI.Container as any)();
		const spy = vi.spyOn(container, 'drawChildren');
		container.draw();
		expect(spy).toHaveBeenCalled();
	});

	it('destroy 调用 destroyChildren', () => {
		const container = new (UI.Container as any)();
		const spy = vi.spyOn(container, 'destroyChildren');
		container.destroy();
		expect(spy).toHaveBeenCalled();
	});
});

describe('UI.Text 构造', () => {
	it('设置默认属性', () => {
		const text = new (UI.Text as any)({});
		expect(text.texture).toBeNull();
		expect(text.printer).toBeNull();
		expect(text._direction).toBe('horizontal-tb');
		expect(text._horizontalAlign).toBe('left');
		expect(text._verticalAlign).toBe('middle');
		expect(text._content).toBe('');
		expect(text._size).toBe(12);
		expect(text._lineSpacing).toBe(0);
		expect(text._letterSpacing).toBe(0);
		expect(text.blend).toBe('normal');
	});

	it('horizontalAlign 只接受 left/center/right', () => {
		const text = new (UI.Text as any)({});
		text.horizontalAlign = 'center';
		expect(text._horizontalAlign).toBe('center');
		text.horizontalAlign = 'invalid';
		expect(text._horizontalAlign).toBe('center');
	});

	it('verticalAlign 只接受 top/middle/bottom', () => {
		const text = new (UI.Text as any)({});
		text.verticalAlign = 'top';
		expect(text._verticalAlign).toBe('top');
		text.verticalAlign = 'bad';
		expect(text._verticalAlign).toBe('top');
	});
});

describe('UI.Image 构造', () => {
	it('默认 display 为 stretch', () => {
		const img = new (UI.Image as any)();
		expect(img.display).toBe('stretch');
	});

	it('flip 默认 none', () => {
		const img = new (UI.Image as any)();
		expect(img.flip).toBe('none');
	});

	it('blend 默认 normal', () => {
		const img = new (UI.Image as any)();
		expect(img.blend).toBe('normal');
	});
});

describe('UIInstanceList', () => {
	it('setProperty 设置嵌套属性', () => {
		const el = { transform: { x: 0 } };
		const list = new UIInstanceList();
		list.push(el);
		list.setProperty('transform-x', 10);
		expect((el.transform as any).x).toBe(10);
	});

	it('resize 对每个元素调用 resize', () => {
		const resizeFn = vi.fn();
		const list = new UIInstanceList();
		list.push({ resize: resizeFn });
		list.push({ resize: resizeFn });
		list.resize();
		expect(resizeFn).toHaveBeenCalledTimes(2);
	});
});

describe('UI.Root', () => {
	it('addReference 和 removeReference', () => {
		const root = new (UI.Root as any)();
		const prefab = { node: { presetId: 'p1' }, parent: null, update: vi.fn() };
		root.addReference(prefab);
		expect(root.references['p1'].length).toBe(1);
		expect(root.references['p1'][0]).toBe(prefab);
		root.removeReference(prefab);
		expect(root.references['p1'].length).toBe(0);
	});
});
