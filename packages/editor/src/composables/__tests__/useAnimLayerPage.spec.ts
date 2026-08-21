import { beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent } from 'vue';
import { mount } from '@vue/test-utils';
import { useAnimSpriteLayerPage } from '@app/composables/useAnimSpriteLayerPage';
import { useAnimParticleLayerPage } from '@app/composables/useAnimParticleLayerPage';
import { useAnimSoundLayerPage } from '@app/composables/useAnimSoundLayerPage';

interface SpriteLayerData {
	sprite: string;
	blend: string;
	light: string;
}

interface ParticleLayerData {
	particleId: string;
	position: string;
	angle: string;
	order: string;
}

interface SoundLayerData {
	playbackRate: string;
}

const animSpriteLayer = vi.hoisted(() => ({
	target: null as SpriteLayerData | null,
	update: vi.fn()
}));

const animParticleLayer = vi.hoisted(() => ({
	target: null as ParticleLayerData | null,
	update: vi.fn()
}));

const animSoundLayer = vi.hoisted(() => ({
	target: null as SoundLayerData | null,
	update: vi.fn()
}));

vi.mock('@app/inspector/inspector.ts', () => ({
	Inspector: {
		animSpriteLayer,
		animParticleLayer,
		animSoundLayer,
		getKey: (el: HTMLElement) => el.id.slice(el.id.indexOf('-') + 1)
	}
}));

const Host = defineComponent({
	props: {
		composable: {
			type: Function,
			required: true
		}
	},
	setup(props) {
		return (props.composable as () => Record<string, unknown>)();
	},
	render: () => null
});

const mountPage = (
	composable: () => Record<string, unknown>
): { wrapper: ReturnType<typeof mount>; page: Record<string, unknown> } => {
	const wrapper = mount(Host, { props: { composable } });
	return {
		wrapper,
		page: wrapper.vm as unknown as Record<string, unknown>
	};
};

const makeSpriteLayer = (overrides: Partial<SpriteLayerData> = {}): SpriteLayerData => ({
	sprite: 'sprite-1',
	blend: 'normal',
	light: 'raw',
	...overrides
});

const makeParticleLayer = (overrides: Partial<ParticleLayerData> = {}): ParticleLayerData => ({
	particleId: 'particle-1',
	position: 'absolute',
	angle: 'default',
	order: 'after',
	...overrides
});

const makeSoundLayer = (overrides: Partial<SoundLayerData> = {}): SoundLayerData => ({
	playbackRate: 'default',
	...overrides
});

beforeEach(() => {
	document.body.innerHTML = '';
	animSpriteLayer.target = null;
	animParticleLayer.target = null;
	animSoundLayer.target = null;
	animSpriteLayer.update.mockClear();
	animParticleLayer.update.mockClear();
	animSoundLayer.update.mockClear();
});

describe('useAnimSpriteLayerPage（animSpriteLayer inspector 页面 composable）', () => {
	it('sync 从 Inspector.animSpriteLayer.target 填充 form', () => {
		const { wrapper, page } = mountPage(useAnimSpriteLayerPage);
		animSpriteLayer.target = makeSpriteLayer();
		(page.sync as () => void)();
		expect(page.form).toMatchObject({
			sprite: 'sprite-1',
			blend: 'normal',
			light: 'raw'
		});
		wrapper.unmount();
	});

	it('target 为 null 时 sync 不覆盖 form', () => {
		const { wrapper, page } = mountPage(useAnimSpriteLayerPage);
		animSpriteLayer.target = makeSpriteLayer();
		(page.sync as () => void)();
		animSpriteLayer.target = null;
		(page.sync as () => void)();
		expect(page.form).toMatchObject({ sprite: 'sprite-1' });
		wrapper.unmount();
	});

	it('onParamInput 找不到 animSpriteLayer 控件时跳过 update', () => {
		const { wrapper, page } = mountPage(useAnimSpriteLayerPage);
		animSpriteLayer.target = makeSpriteLayer();
		const el = document.createElement('input');
		document.body.appendChild(el);
		el.addEventListener('input', (e) => (page.onParamInput as (event: Event) => void)(e));
		el.dispatchEvent(new Event('input', { bubbles: true }));
		expect(animSpriteLayer.update).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('onParamInput 从嵌套元素向上解析控件并调用 update + 重新 sync', () => {
		const { wrapper, page } = mountPage(useAnimSpriteLayerPage);
		animSpriteLayer.update.mockImplementation(
			(layer: SpriteLayerData, key: string, value: unknown) => {
				(layer as unknown as Record<string, unknown>)[key] = value;
			}
		);
		animSpriteLayer.target = makeSpriteLayer();
		const el = document.createElement('div') as HTMLElement;
		el.id = 'animSpriteLayer-blend';
		(page.form as Record<string, unknown>).blend = 'additive';
		const input = document.createElement('input');
		el.appendChild(input);
		document.body.appendChild(el);
		el.addEventListener('input', (e) => (page.onParamInput as (event: Event) => void)(e));
		input.dispatchEvent(new Event('input', { bubbles: true }));
		expect(animSpriteLayer.update).toHaveBeenCalledWith(
			animSpriteLayer.target,
			'blend',
			'additive'
		);
		expect(page.form).toMatchObject({ blend: 'additive' });
		wrapper.unmount();
	});

	it('onParamInput 直接落在控件元素上', () => {
		const { wrapper, page } = mountPage(useAnimSpriteLayerPage);
		animSpriteLayer.target = makeSpriteLayer();
		const el = document.createElement('div') as HTMLElement;
		el.id = 'animSpriteLayer-light';
		(page.form as Record<string, unknown>).light = 'global';
		document.body.appendChild(el);
		el.addEventListener('input', (e) => (page.onParamInput as (event: Event) => void)(e));
		el.dispatchEvent(new Event('input', { bubbles: true }));
		expect(animSpriteLayer.update).toHaveBeenCalledWith(
			animSpriteLayer.target,
			'light',
			'global'
		);
		wrapper.unmount();
	});
});

describe('useAnimParticleLayerPage（animParticleLayer inspector 页面 composable）', () => {
	it('sync 从 Inspector.animParticleLayer.target 填充 form', () => {
		const { wrapper, page } = mountPage(useAnimParticleLayerPage);
		animParticleLayer.target = makeParticleLayer();
		(page.sync as () => void)();
		expect(page.form).toMatchObject({
			particleId: 'particle-1',
			position: 'absolute',
			angle: 'default',
			order: 'after'
		});
		wrapper.unmount();
	});

	it('target 为 null 时 sync 不覆盖 form', () => {
		const { wrapper, page } = mountPage(useAnimParticleLayerPage);
		animParticleLayer.target = makeParticleLayer();
		(page.sync as () => void)();
		animParticleLayer.target = null;
		(page.sync as () => void)();
		expect(page.form).toMatchObject({ particleId: 'particle-1', order: 'after' });
		wrapper.unmount();
	});

	it('onParamInput 找不到 animParticleLayer 控件时跳过 update', () => {
		const { wrapper, page } = mountPage(useAnimParticleLayerPage);
		animParticleLayer.target = makeParticleLayer();
		const el = document.createElement('input');
		document.body.appendChild(el);
		el.addEventListener('input', (e) => (page.onParamInput as (event: Event) => void)(e));
		el.dispatchEvent(new Event('input', { bubbles: true }));
		expect(animParticleLayer.update).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('onParamInput 从嵌套元素向上解析控件并调用 update + 重新 sync', () => {
		const { wrapper, page } = mountPage(useAnimParticleLayerPage);
		animParticleLayer.update.mockImplementation(
			(layer: ParticleLayerData, key: string, value: unknown) => {
				(layer as unknown as Record<string, unknown>)[key] = value;
			}
		);
		animParticleLayer.target = makeParticleLayer();
		const el = document.createElement('div') as HTMLElement;
		el.id = 'animParticleLayer-position';
		(page.form as Record<string, unknown>).position = 'relative';
		const input = document.createElement('input');
		el.appendChild(input);
		document.body.appendChild(el);
		el.addEventListener('input', (e) => (page.onParamInput as (event: Event) => void)(e));
		input.dispatchEvent(new Event('input', { bubbles: true }));
		expect(animParticleLayer.update).toHaveBeenCalledWith(
			animParticleLayer.target,
			'position',
			'relative'
		);
		expect(page.form).toMatchObject({ position: 'relative' });
		wrapper.unmount();
	});

	it('onParamInput 直接落在控件元素上', () => {
		const { wrapper, page } = mountPage(useAnimParticleLayerPage);
		animParticleLayer.target = makeParticleLayer();
		const el = document.createElement('div') as HTMLElement;
		el.id = 'animParticleLayer-order';
		(page.form as Record<string, unknown>).order = 'before';
		document.body.appendChild(el);
		el.addEventListener('input', (e) => (page.onParamInput as (event: Event) => void)(e));
		el.dispatchEvent(new Event('input', { bubbles: true }));
		expect(animParticleLayer.update).toHaveBeenCalledWith(
			animParticleLayer.target,
			'order',
			'before'
		);
		wrapper.unmount();
	});
});

describe('useAnimSoundLayerPage（animSoundLayer inspector 页面 composable）', () => {
	it('sync 从 Inspector.animSoundLayer.target 填充 form', () => {
		const { wrapper, page } = mountPage(useAnimSoundLayerPage);
		animSoundLayer.target = makeSoundLayer({ playbackRate: 'inherit' });
		(page.sync as () => void)();
		expect(page.form).toMatchObject({ playbackRate: 'inherit' });
		wrapper.unmount();
	});

	it('target 为 null 时 sync 不覆盖 form', () => {
		const { wrapper, page } = mountPage(useAnimSoundLayerPage);
		animSoundLayer.target = makeSoundLayer({ playbackRate: 'inherit' });
		(page.sync as () => void)();
		animSoundLayer.target = null;
		(page.sync as () => void)();
		expect(page.form).toMatchObject({ playbackRate: 'inherit' });
		wrapper.unmount();
	});

	it('onParamInput 找不到 animSoundLayer 控件时跳过 update', () => {
		const { wrapper, page } = mountPage(useAnimSoundLayerPage);
		animSoundLayer.target = makeSoundLayer();
		const el = document.createElement('input');
		document.body.appendChild(el);
		el.addEventListener('input', (e) => (page.onParamInput as (event: Event) => void)(e));
		el.dispatchEvent(new Event('input', { bubbles: true }));
		expect(animSoundLayer.update).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('onParamInput 从嵌套元素向上解析控件并调用 update + 重新 sync', () => {
		const { wrapper, page } = mountPage(useAnimSoundLayerPage);
		animSoundLayer.update.mockImplementation(
			(layer: SoundLayerData, key: string, value: unknown) => {
				(layer as unknown as Record<string, unknown>)[key] = value;
			}
		);
		animSoundLayer.target = makeSoundLayer();
		const el = document.createElement('div') as HTMLElement;
		el.id = 'animSoundLayer-playbackRate';
		(page.form as Record<string, unknown>).playbackRate = 'inherit';
		const input = document.createElement('input');
		el.appendChild(input);
		document.body.appendChild(el);
		el.addEventListener('input', (e) => (page.onParamInput as (event: Event) => void)(e));
		input.dispatchEvent(new Event('input', { bubbles: true }));
		expect(animSoundLayer.update).toHaveBeenCalledWith(
			animSoundLayer.target,
			'playbackRate',
			'inherit'
		);
		expect(page.form).toMatchObject({ playbackRate: 'inherit' });
		wrapper.unmount();
	});

	it('onParamInput 直接落在控件元素上', () => {
		const { wrapper, page } = mountPage(useAnimSoundLayerPage);
		animSoundLayer.target = makeSoundLayer();
		const el = document.createElement('div') as HTMLElement;
		el.id = 'animSoundLayer-playbackRate';
		(page.form as Record<string, unknown>).playbackRate = 'inherit';
		document.body.appendChild(el);
		el.addEventListener('input', (e) => (page.onParamInput as (event: Event) => void)(e));
		el.dispatchEvent(new Event('input', { bubbles: true }));
		expect(animSoundLayer.update).toHaveBeenCalledWith(
			animSoundLayer.target,
			'playbackRate',
			'inherit'
		);
		wrapper.unmount();
	});
});
