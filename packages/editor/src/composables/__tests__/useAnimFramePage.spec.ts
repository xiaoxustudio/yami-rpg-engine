import { beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent } from 'vue';
import { mount } from '@vue/test-utils';
import { useAnimJointFramePage } from '@app/composables/useAnimJointFramePage';
import { useAnimSpriteFramePage } from '@app/composables/useAnimSpriteFramePage';
import { useAnimParticleFramePage } from '@app/composables/useAnimParticleFramePage';
import { useAnimSoundFramePage } from '@app/composables/useAnimSoundFramePage';

interface JointFrameData {
	x: number;
	y: number;
	rotation: number;
	scaleX: number;
	scaleY: number;
	opacity: number;
}

interface SpriteFrameData {
	anchorX: number;
	anchorY: number;
	pivotX: number;
	pivotY: number;
	x: number;
	y: number;
	rotation: number;
	scaleX: number;
	scaleY: number;
	opacity: number;
	tint: number[];
}

interface ParticleFrameData {
	x: number;
	y: number;
	rotation: number;
	scaleX: number;
	scaleY: number;
	opacity: number;
	scale: number;
	speed: number;
}

interface SoundFrameData {
	sound: string;
	volume: number;
}

const animJointFrame = vi.hoisted(() => ({
	target: null as JointFrameData | null,
	update: vi.fn()
}));

const animSpriteFrame = vi.hoisted(() => ({
	target: null as SpriteFrameData | null,
	update: vi.fn()
}));

const animParticleFrame = vi.hoisted(() => ({
	target: null as ParticleFrameData | null,
	update: vi.fn()
}));

const animSoundFrame = vi.hoisted(() => ({
	target: null as SoundFrameData | null,
	update: vi.fn()
}));

vi.mock('@app/inspector/inspector.ts', () => ({
	Inspector: {
		animJointFrame,
		animSpriteFrame,
		animParticleFrame,
		animSoundFrame,
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

const makeJointFrame = (overrides: Partial<JointFrameData> = {}): JointFrameData => ({
	x: 10,
	y: 20,
	rotation: 45,
	scaleX: 1.5,
	scaleY: 0.5,
	opacity: 0.8,
	...overrides
});

const makeSpriteFrame = (overrides: Partial<SpriteFrameData> = {}): SpriteFrameData => ({
	anchorX: 0.5,
	anchorY: 0.5,
	pivotX: 0,
	pivotY: 0,
	x: 10,
	y: 20,
	rotation: 45,
	scaleX: 1.5,
	scaleY: 0.5,
	opacity: 0.8,
	tint: [0, 0, 0, 0],
	...overrides
});

const makeParticleFrame = (overrides: Partial<ParticleFrameData> = {}): ParticleFrameData => ({
	x: 10,
	y: 20,
	rotation: 45,
	scaleX: 1.5,
	scaleY: 0.5,
	opacity: 0.8,
	scale: 2,
	speed: 3,
	...overrides
});

const makeSoundFrame = (overrides: Partial<SoundFrameData> = {}): SoundFrameData => ({
	sound: 'bgm.ogg',
	volume: 0.5,
	...overrides
});

beforeEach(() => {
	document.body.innerHTML = '';
	animJointFrame.target = null;
	animSpriteFrame.target = null;
	animParticleFrame.target = null;
	animSoundFrame.target = null;
	animJointFrame.update.mockClear();
	animSpriteFrame.update.mockClear();
	animParticleFrame.update.mockClear();
	animSoundFrame.update.mockClear();
});

describe('useAnimJointFramePage（animJointFrame inspector 页面 composable）', () => {
	it('sync 从 Inspector.animJointFrame.target 填充 form', () => {
		const { wrapper, page } = mountPage(useAnimJointFramePage);
		animJointFrame.target = makeJointFrame();
		(page.sync as () => void)();
		expect(page.form).toMatchObject({
			x: 10,
			y: 20,
			rotation: 45,
			scaleX: 1.5,
			scaleY: 0.5,
			opacity: 0.8
		});
		wrapper.unmount();
	});

	it('target 为 null 时 sync 不覆盖 form', () => {
		const { wrapper, page } = mountPage(useAnimJointFramePage);
		animJointFrame.target = makeJointFrame();
		(page.sync as () => void)();
		animJointFrame.target = null;
		(page.sync as () => void)();
		expect(page.form).toMatchObject({ x: 10, opacity: 0.8 });
		wrapper.unmount();
	});

	it('onParamInput 找不到 animJointFrame 控件时跳过 update', () => {
		const { wrapper, page } = mountPage(useAnimJointFramePage);
		animJointFrame.target = makeJointFrame();
		const el = document.createElement('input');
		document.body.appendChild(el);
		el.addEventListener('input', (e) => (page.onParamInput as (event: Event) => void)(e));
		el.dispatchEvent(new Event('input', { bubbles: true }));
		expect(animJointFrame.update).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('onParamInput 从嵌套元素向上解析控件并调用 update + 重新 sync', () => {
		const { wrapper, page } = mountPage(useAnimJointFramePage);
		animJointFrame.update.mockImplementation(
			(frame: JointFrameData, key: string, value: unknown) => {
				(frame as unknown as Record<string, unknown>)[key] = value;
			}
		);
		animJointFrame.target = makeJointFrame();
		const el = document.createElement('div') as HTMLElement;
		el.id = 'animJointFrame-x';
		(page.form as Record<string, unknown>).x = 99;
		const input = document.createElement('input');
		el.appendChild(input);
		document.body.appendChild(el);
		el.addEventListener('input', (e) => (page.onParamInput as (event: Event) => void)(e));
		input.dispatchEvent(new Event('input', { bubbles: true }));
		expect(animJointFrame.update).toHaveBeenCalledWith(animJointFrame.target, 'x', 99);
		expect(page.form).toMatchObject({ x: 99 });
		wrapper.unmount();
	});

	it('onParamInput 直接落在控件元素上', () => {
		const { wrapper, page } = mountPage(useAnimJointFramePage);
		animJointFrame.target = makeJointFrame();
		const el = document.createElement('div') as HTMLElement;
		el.id = 'animJointFrame-rotation';
		(page.form as Record<string, unknown>).rotation = 90;
		document.body.appendChild(el);
		el.addEventListener('input', (e) => (page.onParamInput as (event: Event) => void)(e));
		el.dispatchEvent(new Event('input', { bubbles: true }));
		expect(animJointFrame.update).toHaveBeenCalledWith(animJointFrame.target, 'rotation', 90);
		wrapper.unmount();
	});
});

describe('useAnimSpriteFramePage（animSpriteFrame inspector 页面 composable）', () => {
	it('sync 从 Inspector.animSpriteFrame.target 填充 form（含 tint 数组拷贝）', () => {
		const { wrapper, page } = mountPage(useAnimSpriteFramePage);
		animSpriteFrame.target = makeSpriteFrame({ tint: [10, 20, 30, 255] });
		(page.sync as () => void)();
		expect(page.form).toMatchObject({
			anchorX: 0.5,
			anchorY: 0.5,
			pivotX: 0,
			pivotY: 0,
			x: 10,
			y: 20,
			rotation: 45,
			scaleX: 1.5,
			scaleY: 0.5,
			opacity: 0.8
		});
		expect(page.form).toMatchObject({ tint: [10, 20, 30, 255] });
		expect((page.form as { tint: number[] }).tint).not.toBe(animSpriteFrame.target?.tint);
		wrapper.unmount();
	});

	it('target 为 null 时 sync 不覆盖 form', () => {
		const { wrapper, page } = mountPage(useAnimSpriteFramePage);
		animSpriteFrame.target = makeSpriteFrame();
		(page.sync as () => void)();
		animSpriteFrame.target = null;
		(page.sync as () => void)();
		expect(page.form).toMatchObject({ x: 10, tint: [0, 0, 0, 0] });
		wrapper.unmount();
	});

	it('onParamInput 找不到 animSpriteFrame 控件时跳过 update', () => {
		const { wrapper, page } = mountPage(useAnimSpriteFramePage);
		animSpriteFrame.target = makeSpriteFrame();
		const el = document.createElement('input');
		document.body.appendChild(el);
		el.addEventListener('input', (e) => (page.onParamInput as (event: Event) => void)(e));
		el.dispatchEvent(new Event('input', { bubbles: true }));
		expect(animSpriteFrame.update).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('onParamInput 从嵌套元素向上解析控件并调用 update + 重新 sync', () => {
		const { wrapper, page } = mountPage(useAnimSpriteFramePage);
		animSpriteFrame.update.mockImplementation(
			(frame: SpriteFrameData, key: string, value: unknown) => {
				(frame as unknown as Record<string, unknown>)[key] = value;
			}
		);
		animSpriteFrame.target = makeSpriteFrame();
		const el = document.createElement('div') as HTMLElement;
		el.id = 'animSpriteFrame-anchorX';
		(page.form as Record<string, unknown>).anchorX = '0.25';
		const input = document.createElement('input');
		el.appendChild(input);
		document.body.appendChild(el);
		el.addEventListener('input', (e) => (page.onParamInput as (event: Event) => void)(e));
		input.dispatchEvent(new Event('input', { bubbles: true }));
		expect(animSpriteFrame.update).toHaveBeenCalledWith(
			animSpriteFrame.target,
			'anchorX',
			'0.25'
		);
		expect(page.form).toMatchObject({ anchorX: '0.25' });
		wrapper.unmount();
	});

	it('onParamInput 直接落在 tint 控件元素上（key 含 - 下标）', () => {
		const { wrapper, page } = mountPage(useAnimSpriteFramePage);
		animSpriteFrame.update.mockImplementation(
			(frame: SpriteFrameData, key: string, value: unknown) => {
				(frame as unknown as Record<string, unknown>)[key] = value;
			}
		);
		animSpriteFrame.target = makeSpriteFrame();
		const el = document.createElement('div') as HTMLElement;
		el.id = 'animSpriteFrame-tint-2';
		(page.form as Record<string, unknown>)['tint-2'] = 128;
		document.body.appendChild(el);
		el.addEventListener('input', (e) => (page.onParamInput as (event: Event) => void)(e));
		el.dispatchEvent(new Event('input', { bubbles: true }));
		expect(animSpriteFrame.update).toHaveBeenCalledWith(animSpriteFrame.target, 'tint-2', 128);
		wrapper.unmount();
	});
});

describe('useAnimParticleFramePage（animParticleFrame inspector 页面 composable）', () => {
	it('sync 从 Inspector.animParticleFrame.target 填充 form', () => {
		const { wrapper, page } = mountPage(useAnimParticleFramePage);
		animParticleFrame.target = makeParticleFrame();
		(page.sync as () => void)();
		expect(page.form).toMatchObject({
			x: 10,
			y: 20,
			rotation: 45,
			scaleX: 1.5,
			scaleY: 0.5,
			opacity: 0.8,
			scale: 2,
			speed: 3
		});
		wrapper.unmount();
	});

	it('target 为 null 时 sync 不覆盖 form', () => {
		const { wrapper, page } = mountPage(useAnimParticleFramePage);
		animParticleFrame.target = makeParticleFrame();
		(page.sync as () => void)();
		animParticleFrame.target = null;
		(page.sync as () => void)();
		expect(page.form).toMatchObject({ scale: 2, speed: 3 });
		wrapper.unmount();
	});

	it('onParamInput 找不到 animParticleFrame 控件时跳过 update', () => {
		const { wrapper, page } = mountPage(useAnimParticleFramePage);
		animParticleFrame.target = makeParticleFrame();
		const el = document.createElement('input');
		document.body.appendChild(el);
		el.addEventListener('input', (e) => (page.onParamInput as (event: Event) => void)(e));
		el.dispatchEvent(new Event('input', { bubbles: true }));
		expect(animParticleFrame.update).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('onParamInput 从嵌套元素向上解析控件并调用 update + 重新 sync', () => {
		const { wrapper, page } = mountPage(useAnimParticleFramePage);
		animParticleFrame.update.mockImplementation(
			(frame: ParticleFrameData, key: string, value: unknown) => {
				(frame as unknown as Record<string, unknown>)[key] = value;
			}
		);
		animParticleFrame.target = makeParticleFrame();
		const el = document.createElement('div') as HTMLElement;
		el.id = 'animParticleFrame-speed';
		(page.form as Record<string, unknown>).speed = 5;
		const input = document.createElement('input');
		el.appendChild(input);
		document.body.appendChild(el);
		el.addEventListener('input', (e) => (page.onParamInput as (event: Event) => void)(e));
		input.dispatchEvent(new Event('input', { bubbles: true }));
		expect(animParticleFrame.update).toHaveBeenCalledWith(animParticleFrame.target, 'speed', 5);
		expect(page.form).toMatchObject({ speed: 5 });
		wrapper.unmount();
	});

	it('onParamInput 直接落在控件元素上', () => {
		const { wrapper, page } = mountPage(useAnimParticleFramePage);
		animParticleFrame.target = makeParticleFrame();
		const el = document.createElement('div') as HTMLElement;
		el.id = 'animParticleFrame-opacity';
		(page.form as Record<string, unknown>).opacity = 0.5;
		document.body.appendChild(el);
		el.addEventListener('input', (e) => (page.onParamInput as (event: Event) => void)(e));
		el.dispatchEvent(new Event('input', { bubbles: true }));
		expect(animParticleFrame.update).toHaveBeenCalledWith(
			animParticleFrame.target,
			'opacity',
			0.5
		);
		wrapper.unmount();
	});
});

describe('useAnimSoundFramePage（animSoundFrame inspector 页面 composable）', () => {
	it('sync 从 Inspector.animSoundFrame.target 填充 form', () => {
		const { wrapper, page } = mountPage(useAnimSoundFramePage);
		animSoundFrame.target = makeSoundFrame();
		(page.sync as () => void)();
		expect(page.form).toMatchObject({ sound: 'bgm.ogg', volume: 0.5 });
		wrapper.unmount();
	});

	it('target 为 null 时 sync 不覆盖 form', () => {
		const { wrapper, page } = mountPage(useAnimSoundFramePage);
		animSoundFrame.target = makeSoundFrame();
		(page.sync as () => void)();
		animSoundFrame.target = null;
		(page.sync as () => void)();
		expect(page.form).toMatchObject({ sound: 'bgm.ogg' });
		wrapper.unmount();
	});

	it('onParamInput 找不到 animSoundFrame 控件时跳过 update', () => {
		const { wrapper, page } = mountPage(useAnimSoundFramePage);
		animSoundFrame.target = makeSoundFrame();
		const el = document.createElement('input');
		document.body.appendChild(el);
		el.addEventListener('input', (e) => (page.onParamInput as (event: Event) => void)(e));
		el.dispatchEvent(new Event('input', { bubbles: true }));
		expect(animSoundFrame.update).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('onParamInput 从嵌套元素向上解析控件并调用 update + 重新 sync', () => {
		const { wrapper, page } = mountPage(useAnimSoundFramePage);
		animSoundFrame.update.mockImplementation(
			(frame: SoundFrameData, key: string, value: unknown) => {
				(frame as unknown as Record<string, unknown>)[key] = value;
			}
		);
		animSoundFrame.target = makeSoundFrame();
		const el = document.createElement('div') as HTMLElement;
		el.id = 'animSoundFrame-volume';
		(page.form as Record<string, unknown>).volume = 0.9;
		const input = document.createElement('input');
		el.appendChild(input);
		document.body.appendChild(el);
		el.addEventListener('input', (e) => (page.onParamInput as (event: Event) => void)(e));
		input.dispatchEvent(new Event('input', { bubbles: true }));
		expect(animSoundFrame.update).toHaveBeenCalledWith(animSoundFrame.target, 'volume', 0.9);
		expect(page.form).toMatchObject({ volume: 0.9 });
		wrapper.unmount();
	});

	it('onParamInput 直接落在控件元素上', () => {
		const { wrapper, page } = mountPage(useAnimSoundFramePage);
		animSoundFrame.target = makeSoundFrame();
		const el = document.createElement('div') as HTMLElement;
		el.id = 'animSoundFrame-sound';
		(page.form as Record<string, unknown>).sound = 'se.ogg';
		document.body.appendChild(el);
		el.addEventListener('input', (e) => (page.onParamInput as (event: Event) => void)(e));
		el.dispatchEvent(new Event('input', { bubbles: true }));
		expect(animSoundFrame.update).toHaveBeenCalledWith(
			animSoundFrame.target,
			'sound',
			'se.ogg'
		);
		wrapper.unmount();
	});
});
