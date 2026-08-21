import { beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent } from 'vue';
import { mount } from '@vue/test-utils';
import { useFileScenePage } from '@app/composables/useFileScenePage';

interface SceneData {
	width: number;
	height: number;
	tileWidth: number;
	tileHeight: number;
	ambient: { red: number; green: number; blue: number; direct: number };
}

const Scene = vi.hoisted(() => ({
	width: 20,
	height: 20,
	tileWidth: 32,
	tileHeight: 32,
	ambient: { red: 255, green: 255, blue: 255, direct: 0 }
}));

const fileScene = vi.hoisted(() => ({
	target: null as SceneData | null,
	update: vi.fn()
}));

vi.mock('@app/inspector/inspector.ts', () => ({
	Inspector: {
		fileScene,
		getKey: (el: HTMLElement) => el.id.slice(el.id.indexOf('-') + 1)
	}
}));

vi.mock('@app/scene/scene-window.ts', () => ({
	Scene
}));

const Host = defineComponent({
	setup() {
		return useFileScenePage();
	},
	render: () => null
});

const makeScene = (overrides: Partial<SceneData> = {}): SceneData => ({
	width: 20,
	height: 20,
	tileWidth: 32,
	tileHeight: 32,
	ambient: { red: 255, green: 128, blue: 64, direct: 0.5 },
	...overrides
});

describe('useFileScenePage（fileScene inspector 页面 composable）', () => {
	beforeEach(() => {
		document.body.innerHTML = '';
		fileScene.target = null;
		fileScene.update.mockClear();
	});

	const mountPage = () => {
		const wrapper = mount(Host);
		return {
			wrapper,
			page: wrapper.vm as unknown as ReturnType<typeof useFileScenePage>
		};
	};

	it('sync 从 Scene 填充 form（target 存在时）', () => {
		const { wrapper, page } = mountPage();
		fileScene.target = makeScene();
		Scene.width = 30;
		Scene.height = 40;
		Scene.tileWidth = 16;
		Scene.tileHeight = 48;
		Scene.ambient = { red: 10, green: 20, blue: 30, direct: 0.8 };
		page.sync();
		expect(page.form.width).toBe(30);
		expect(page.form.height).toBe(40);
		expect(page.form.tileWidth).toBe(16);
		expect(page.form.tileHeight).toBe(48);
		expect(page.form.ambientRed).toBe(10);
		expect(page.form.ambientGreen).toBe(20);
		expect(page.form.ambientBlue).toBe(30);
		expect(page.form.ambientDirect).toBe(0.8);
		wrapper.unmount();
	});

	it('target 为 null 时 sync 不覆盖 form', () => {
		const { wrapper, page } = mountPage();
		fileScene.target = makeScene();
		page.sync();
		fileScene.target = null;
		page.sync();
		expect(page.form.width).toBe(30);
		expect(page.form.ambientRed).toBe(10);
		wrapper.unmount();
	});

	it('onParamInput 找不到 fileScene 控件时跳过 update', () => {
		const { wrapper, page } = mountPage();
		fileScene.target = makeScene();
		const el = document.createElement('input');
		document.body.appendChild(el);
		el.addEventListener('input', (e) => page.onParamInput(e));
		el.dispatchEvent(new Event('input', { bubbles: true }));
		expect(fileScene.update).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('onParamInput 从嵌套元素向上解析控件并调用 update + 重新 sync', () => {
		const { wrapper, page } = mountPage();
		fileScene.update.mockImplementation((scene: SceneData, key: string, value: unknown) => {
			if (key.startsWith('ambient-')) {
				(scene.ambient as Record<string, unknown>)[key.slice(8)] = value;
				(Scene.ambient as Record<string, unknown>)[key.slice(8)] = value;
			} else {
				(scene as unknown as Record<string, unknown>)[key] = value;
			}
		});
		fileScene.target = makeScene();
		Scene.ambient = { red: 255, green: 255, blue: 255, direct: 0 };
		const el = document.createElement('div') as HTMLElement & { read: () => number };
		el.id = 'fileScene-ambient-red';
		el.read = () => 100;
		const input = document.createElement('input');
		el.appendChild(input);
		document.body.appendChild(el);
		el.addEventListener('input', (e) => page.onParamInput(e));
		input.dispatchEvent(new Event('input', { bubbles: true }));
		expect(fileScene.update).toHaveBeenCalledWith(fileScene.target, 'ambient-red', 100);
		expect(page.form.ambientRed).toBe(100);
		wrapper.unmount();
	});

	it('onParamInput 直接落在控件元素上', () => {
		const { wrapper, page } = mountPage();
		fileScene.target = makeScene();
		const el = document.createElement('div') as HTMLElement & { read: () => number };
		el.id = 'fileScene-tileWidth';
		el.read = () => 64;
		document.body.appendChild(el);
		el.addEventListener('input', (e) => page.onParamInput(e));
		el.dispatchEvent(new Event('input', { bubbles: true }));
		expect(fileScene.update).toHaveBeenCalledWith(fileScene.target, 'tileWidth', 64);
		wrapper.unmount();
	});
});
