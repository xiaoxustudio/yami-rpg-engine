import { beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent } from 'vue';
import { mount } from '@vue/test-utils';
import { useSceneParticlePage } from '@app/composables/useSceneParticlePage';

interface ParticleData {
	name: string;
	particleId: string;
	x: number;
	y: number;
	angle: number;
	scale: number;
	speed: number;
	opacity: number;
	priority: number;
}

const sceneParticle = vi.hoisted(() => ({
	target: null as ParticleData | null,
	update: vi.fn()
}));

vi.mock('@app/inspector/inspector.ts', () => ({
	Inspector: {
		sceneParticle,
		getKey: (el: HTMLElement) => el.id.slice(el.id.indexOf('-') + 1)
	}
}));

const Host = defineComponent({
	setup() {
		return useSceneParticlePage();
	},
	render: () => null
});

const makeParticle = (overrides: Partial<ParticleData> = {}): ParticleData => ({
	name: 'Particle 1',
	particleId: 'particle-1',
	x: 10,
	y: 20,
	angle: 45,
	scale: 1,
	speed: 1,
	opacity: 1,
	priority: 0,
	...overrides
});

describe('useSceneParticlePage（sceneParticle inspector 页面 composable）', () => {
	beforeEach(() => {
		document.body.innerHTML = '';
		sceneParticle.target = null;
		sceneParticle.update.mockClear();
	});

	const mountPage = () => {
		const wrapper = mount(Host);
		return {
			wrapper,
			page: wrapper.vm as unknown as ReturnType<typeof useSceneParticlePage>
		};
	};

	it('sync 从 Inspector.sceneParticle.target 填充 form', () => {
		const { wrapper, page } = mountPage();
		sceneParticle.target = makeParticle();
		page.sync();
		expect(page.form.name).toBe('Particle 1');
		expect(page.form.particleId).toBe('particle-1');
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
		sceneParticle.target = makeParticle();
		page.sync();
		sceneParticle.target = null;
		page.sync();
		expect(page.form.name).toBe('Particle 1');
		expect(page.form.priority).toBe(0);
		wrapper.unmount();
	});

	it('onParamInput 找不到 sceneParticle 控件时跳过 update', () => {
		const { wrapper, page } = mountPage();
		sceneParticle.target = makeParticle();
		const el = document.createElement('input');
		document.body.appendChild(el);
		el.addEventListener('input', (e) => page.onParamInput(e));
		el.dispatchEvent(new Event('input', { bubbles: true }));
		expect(sceneParticle.update).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('onParamInput 从嵌套元素向上解析控件并调用 update + 重新 sync', () => {
		const { wrapper, page } = mountPage();
		sceneParticle.update.mockImplementation(
			(particle: ParticleData, key: string, value: unknown) => {
				(particle as unknown as Record<string, unknown>)[key] = value;
			}
		);
		sceneParticle.target = makeParticle();
		page.form.name = 'Particle 3';
		const el = document.createElement('div') as HTMLElement;
		el.id = 'sceneParticle-name';
		const input = document.createElement('input');
		el.appendChild(input);
		document.body.appendChild(el);
		el.addEventListener('input', (e) => page.onParamInput(e));
		input.dispatchEvent(new Event('input', { bubbles: true }));
		expect(sceneParticle.update).toHaveBeenCalledWith(
			sceneParticle.target,
			'name',
			'Particle 3'
		);
		expect(page.form.name).toBe('Particle 3');
		wrapper.unmount();
	});

	it('onParamInput 直接落在控件元素上', () => {
		const { wrapper, page } = mountPage();
		sceneParticle.target = makeParticle();
		page.form.angle = 90;
		const el = document.createElement('div') as HTMLElement;
		el.id = 'sceneParticle-angle';
		document.body.appendChild(el);
		el.addEventListener('input', (e) => page.onParamInput(e));
		el.dispatchEvent(new Event('input', { bubbles: true }));
		expect(sceneParticle.update).toHaveBeenCalledWith(sceneParticle.target, 'angle', 90);
		wrapper.unmount();
	});
});
