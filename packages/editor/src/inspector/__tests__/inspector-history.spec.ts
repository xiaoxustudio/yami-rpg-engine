import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { registerElement } from '@app/utils/element-registry';
import { inspectorEls } from '@app/inspector/element-registry.ts';
vi.setConfig({ testTimeout: 30000 });
import { reactive } from 'vue';

vi.mock('@app/animation/animation-window.ts', () => ({
	Animation: {
		setMotion: vi.fn(),
		setDirection: vi.fn(),
		openLayer: vi.fn(),
		selectFrame: vi.fn()
	}
}));

vi.mock('@app/log/log-window.ts', () => ({
	Log: { throw: vi.fn() }
}));

vi.mock('@app/tools/window-object.ts', () => ({
	Window: {
		activeElement: null,
		initialize: vi.fn(),
		open: vi.fn(),
		close: vi.fn(),
		confirm: vi.fn()
	}
}));

vi.mock('@app/composables/usePointerObjectWindow', () => ({
	Cursor: { open: vi.fn(), close: vi.fn() }
}));

import { Inspector } from '@app/inspector/inspector.ts';
import { History } from '@app/tools/history.ts';

interface FakeInput extends HTMLElement {
	read(): unknown;
	write(value: unknown): void;
}

const createInput = (id: string, initial: unknown): FakeInput => {
	const input = document.createElement('div') as unknown as FakeInput;
	input.id = id;
	let value = initial;
	input.read = () => value;
	input.write = (v: unknown) => {
		value = v;
	};
	return input;
};

const createMount = (id: string, form?: unknown): HTMLElement => {
	const mount = document.createElement('div');
	mount.id = id;
	if (form !== undefined) {
		(mount as unknown as { form: unknown }).form = form;
	}
	document.body.appendChild(mount);
	// P1b：页面模块改从 inspectorEls 取 `<page>-vue-mount`（不再按 id 直查）→ 用例自建的宿主也要登记
	registerElement(inspectorEls, id, mount);
	return mount;
};

const createEditor = (target: unknown) => ({
	target,
	update: vi.fn(),
	owner: { setTarget: vi.fn() }
});

describe('inspector-change History 处理器（form 桥优先 + write/dispatch 降级）', () => {
	let processor: (operation: string, data: unknown) => void;

	beforeAll(() => {
		vi.spyOn(console, 'warn').mockImplementation(() => {});
		const manager = document.createElement('div');
		manager.id = 'inspector-page-manager';
		document.body.appendChild(manager);
		const inspector = document.createElement('div');
		inspector.id = 'inspector';
		document.body.appendChild(inspector);
		// P5b 批次 3：Inspector.initialize 改从 inspectorEls 取 manager（不再查 DOM），故测试需登记
		registerElement(inspectorEls, 'inspector-page-manager', manager);
		registerElement(inspectorEls, 'inspector', inspector);
		Inspector.initialize();
		processor = History.processors['inspector-change'] as (
			operation: string,
			data: unknown
		) => void;
		expect(typeof processor).toBe('function');
	});

	beforeEach(() => {
		for (const el of Array.from(document.body.children)) {
			if (el.id !== 'inspector-page-manager' && el.id !== 'inspector') {
				el.remove();
			}
		}
	});

	it('undo 经 form 桥写回嵌套路径（particleLayer 约定：color-tint-2）', () => {
		const form = reactive({ color: { tint: [0, 0, 0, 0] } });
		const mount = createMount('particleLayer-vue-mount', form);
		const input = createInput('particleLayer-color-tint-2', 9);
		mount.appendChild(input);
		const listener = vi.fn();
		input.addEventListener('input', listener);
		const target = {};
		const editor = createEditor(target);
		processor('undo', {
			editor,
			target,
			changes: [{ input, oldValue: 5, newValue: 9 }]
		});
		expect(form.color.tint[2]).toBe(5);
		expect(input.read()).toBe(5);
		expect(listener).toHaveBeenCalledTimes(1);
		expect(editor.owner.setTarget).toHaveBeenCalledWith(target);
	});

	it('redo 经 form 桥写回新值', () => {
		const form = reactive({ color: { tint: [0, 0, 0, 0] } });
		const mount = createMount('particleLayer-vue-mount', form);
		const input = createInput('particleLayer-color-tint-3', 5);
		mount.appendChild(input);
		const target = {};
		processor('redo', {
			editor: createEditor(target),
			target,
			changes: [{ input, oldValue: 5, newValue: 9 }]
		});
		expect(form.color.tint[3]).toBe(9);
		expect(input.read()).toBe(9);
	});

	it('undo 经 form 桥写回 camelCase 扁平键（fileTrigger 约定：shape-width）', () => {
		const form = reactive({ shapeWidth: 1 });
		const mount = createMount('fileTrigger-vue-mount', form);
		const input = createInput('fileTrigger-shape-width', 1);
		mount.appendChild(input);
		const target = {};
		processor('undo', {
			editor: createEditor(target),
			target,
			changes: [{ input, oldValue: 8, newValue: 1 }]
		});
		expect(form.shapeWidth).toBe(8);
		expect(input.read()).toBe(8);
	});

	it('undo 经 form 桥写回直接键（uiText 约定：direction）', () => {
		const form = reactive({ direction: 'horizontal-tb' });
		const mount = createMount('uiText-vue-mount', form);
		const input = createInput('uiText-direction', 'horizontal-tb');
		mount.appendChild(input);
		const target = {};
		processor('undo', {
			editor: createEditor(target),
			target,
			changes: [{ input, oldValue: 'vertical-rl', newValue: 'horizontal-tb' }]
		});
		expect(form.direction).toBe('vertical-rl');
		expect(input.read()).toBe('vertical-rl');
	});

	it('undo 写回组内数组索引键（uiButton 约定：normalTint-0）', () => {
		const form = reactive({ normalTint: [0, 0, 0, 0] });
		const mount = createMount('uiButton-vue-mount', form);
		const input = createInput('uiButton-normalTint-0', 0);
		mount.appendChild(input);
		const target = {};
		processor('undo', {
			editor: createEditor(target),
			target,
			changes: [{ input, oldValue: 255, newValue: 0 }]
		});
		expect(form.normalTint[0]).toBe(255);
		expect(input.read()).toBe(255);
	});

	it('无 form 桥（挂载容器缺 form）时降级 write+dispatch', () => {
		const mount = createMount('fileActor-vue-mount');
		const input = createInput('fileActor-name', 'old');
		mount.appendChild(input);
		const listener = vi.fn();
		input.addEventListener('input', listener);
		const target = {};
		const editor = createEditor(target);
		processor('undo', {
			editor,
			target,
			changes: [{ input, oldValue: 'new', newValue: 'old' }]
		});
		expect(input.read()).toBe('new');
		expect(listener).toHaveBeenCalledTimes(1);
		expect(editor.owner.setTarget).toHaveBeenCalledWith(target);
	});

	it('不在挂载容器内的输入降级 write+dispatch', () => {
		const input = createInput('sceneActor-name', 'old');
		document.body.appendChild(input);
		const listener = vi.fn();
		input.addEventListener('input', listener);
		const target = {};
		processor('undo', {
			editor: createEditor(target),
			target,
			changes: [{ input, oldValue: 'new', newValue: 'old' }]
		});
		expect(input.read()).toBe('new');
		expect(listener).toHaveBeenCalledTimes(1);
	});

	it('form 桥存在但键不可解析时降级 write+dispatch 且 form 不变', () => {
		const form = reactive({ unrelated: 1 });
		const mount = createMount('particleLayer-vue-mount', form);
		const input = createInput('particleLayer-align-left', 'left');
		mount.appendChild(input);
		const listener = vi.fn();
		input.addEventListener('input', listener);
		const target = {};
		processor('undo', {
			editor: createEditor(target),
			target,
			changes: [{ input, oldValue: 'center', newValue: 'left' }]
		});
		expect(input.read()).toBe('center');
		expect(listener).toHaveBeenCalledTimes(1);
		expect(form.unrelated).toBe(1);
		expect('align' in form).toBe(false);
	});

	it('目标不在当前编辑器时走 editor.update 分支', () => {
		const form = reactive({ color: { tint: [0, 0, 0, 0] } });
		const mount = createMount('particleLayer-vue-mount', form);
		const input = createInput('particleLayer-color-tint-1', 9);
		mount.appendChild(input);
		const listener = vi.fn();
		input.addEventListener('input', listener);
		const editor = createEditor(null);
		const target = {};
		processor('undo', {
			editor,
			target,
			changes: [{ input, oldValue: 5, newValue: 9 }]
		});
		expect(editor.update).toHaveBeenCalledWith(target, 'color-tint-1', 5);
		expect(input.read()).toBe(9);
		expect(listener).not.toHaveBeenCalled();
	});
});
