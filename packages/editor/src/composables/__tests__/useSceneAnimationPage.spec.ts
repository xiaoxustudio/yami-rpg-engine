import { beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent } from 'vue';
import { mount } from '@vue/test-utils';
import { useSceneAnimationPage } from '@app/composables/useSceneAnimationPage';

interface AnimationData {
	name: string;
	animationId: string;
	motion: string;
	rotatable: boolean;
	x: number;
	y: number;
	angle: number;
	scale: number;
	speed: number;
	opacity: number;
	priority: number;
}

const sceneAnimation = vi.hoisted(() => ({
	target: null as AnimationData | null,
	update: vi.fn()
}));

vi.mock('@app/legacy/inspector/inspector.ts', () => ({
	Inspector: {
		sceneAnimation,
		getKey: (el: HTMLElement) => el.id.slice(el.id.indexOf('-') + 1)
	}
}));

const Host = defineComponent({
	setup() {
		return useSceneAnimationPage();
	},
	render: () => null
});

const makeAnimation = (overrides: Partial<AnimationData> = {}): AnimationData => ({
	name: 'Animation 1',
	animationId: 'anim-1',
	motion: 'idle',
	rotatable: true,
	x: 10,
	y: 20,
	angle: 45,
	scale: 1,
	speed: 1,
	opacity: 1,
	priority: 0,
	...overrides
});

describe('useSceneAnimationPage（sceneAnimation inspector 页面 composable）', () => {
	beforeEach(() => {
		document.body.innerHTML = '';
		sceneAnimation.target = null;
		sceneAnimation.update.mockClear();
	});

	const mountPage = () => {
		const wrapper = mount(Host);
		return {
			wrapper,
			page: wrapper.vm as unknown as ReturnType<typeof useSceneAnimationPage>
		};
	};

	it('sync 从 Inspector.sceneAnimation.target 填充 form', () => {
		const { wrapper, page } = mountPage();
		sceneAnimation.target = makeAnimation();
		page.sync();
		expect(page.form.name).toBe('Animation 1');
		expect(page.form.animationId).toBe('anim-1');
		expect(page.form.motion).toBe('idle');
		expect(page.form.rotatable).toBe(true);
		expect(page.form.x).toBe(10);
		expect(page.form.y).toBe(20);
		expect(page.form.angle).toBe(45);
		expect(page.form.scale).toBe(1);
		expect(page.form.speed).toBe(1);
		expect(page.form.opacity).toBe(1);
		expect(page.form.priority).toBe(0);
		wrapper.unmount();
	});

	it('target 为 null 时 sync 不覆盖 form', () => {
		const { wrapper, page } = mountPage();
		sceneAnimation.target = makeAnimation();
		page.sync();
		sceneAnimation.target = null;
		page.sync();
		expect(page.form.name).toBe('Animation 1');
		expect(page.form.priority).toBe(0);
		wrapper.unmount();
	});

	it('onParamInput 找不到 sceneAnimation 控件时跳过 update', () => {
		const { wrapper, page } = mountPage();
		sceneAnimation.target = makeAnimation();
		const el = document.createElement('input');
		document.body.appendChild(el);
		el.addEventListener('input', (e) => page.onParamInput(e));
		el.dispatchEvent(new Event('input', { bubbles: true }));
		expect(sceneAnimation.update).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('onParamInput 从嵌套元素向上解析控件并调用 update + 重新 sync', () => {
		const { wrapper, page } = mountPage();
		sceneAnimation.update.mockImplementation(
			(animation: AnimationData, key: string, value: unknown) => {
				(animation as unknown as Record<string, unknown>)[key] = value;
			}
		);
		sceneAnimation.target = makeAnimation();
		const el = document.createElement('div') as HTMLElement & { read: () => string };
		el.id = 'sceneAnimation-name';
		el.read = () => 'Animation 3';
		const input = document.createElement('input');
		el.appendChild(input);
		document.body.appendChild(el);
		el.addEventListener('input', (e) => page.onParamInput(e));
		input.dispatchEvent(new Event('input', { bubbles: true }));
		expect(sceneAnimation.update).toHaveBeenCalledWith(
			sceneAnimation.target,
			'name',
			'Animation 3'
		);
		expect(page.form.name).toBe('Animation 3');
		wrapper.unmount();
	});

	it('onParamInput 直接落在控件元素上', () => {
		const { wrapper, page } = mountPage();
		sceneAnimation.target = makeAnimation();
		const el = document.createElement('div') as HTMLElement & { read: () => number };
		el.id = 'sceneAnimation-angle';
		el.read = () => 90;
		document.body.appendChild(el);
		el.addEventListener('input', (e) => page.onParamInput(e));
		el.dispatchEvent(new Event('input', { bubbles: true }));
		expect(sceneAnimation.update).toHaveBeenCalledWith(sceneAnimation.target, 'angle', 90);
		wrapper.unmount();
	});
});
