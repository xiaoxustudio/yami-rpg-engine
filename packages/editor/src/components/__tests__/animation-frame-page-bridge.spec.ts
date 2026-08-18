import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import AnimJointFramePage from '@app/components/inspector/AnimJointFramePage.vue';
import AnimParticleFramePage from '@app/components/inspector/AnimParticleFramePage.vue';
import AnimSoundFramePage from '@app/components/inspector/AnimSoundFramePage.vue';

interface JointFrameData {
	x: number;
	y: number;
	rotation: number;
	scaleX: number;
	scaleY: number;
	opacity: number;
}

interface ParticleFrameData extends JointFrameData {
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

const animParticleFrame = vi.hoisted(() => ({
	target: null as ParticleFrameData | null,
	update: vi.fn()
}));

const animSoundFrame = vi.hoisted(() => ({
	target: null as SoundFrameData | null,
	update: vi.fn()
}));

vi.mock('@app/legacy/inspector/inspector.ts', () => ({
	Inspector: {
		animJointFrame,
		animParticleFrame,
		animSoundFrame,
		getKey: (el: HTMLElement) => el.id.slice(el.id.indexOf('-') + 1)
	}
}));

vi.mock('@app/stores/animation', () => ({
	useAnimationStore: () => ({ syncState: vi.fn() })
}));

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ getLabel: () => '', syncState: vi.fn() })
}));

type SyncEl = HTMLElement & { sync?: () => void };

describe('animation-frame 页（inspector sync 响应式桥接——P3 迁移回归保护）', () => {
	beforeEach(() => {
		document.body.innerHTML = '';
		animJointFrame.target = null;
		animParticleFrame.target = null;
		animSoundFrame.target = null;
		animJointFrame.update.mockClear();
		animParticleFrame.update.mockClear();
		animSoundFrame.update.mockClear();
	});

	const mountPage = async (mountId: string, component: typeof AnimJointFramePage) => {
		const host = document.createElement('div');
		host.id = mountId;
		document.body.appendChild(host);
		const wrapper = mount(component, {
			attachTo: document.body
		});
		await wrapper.vm.$nextTick();
		await wrapper.vm.$nextTick();
		return wrapper;
	};

	const read = (id: string) =>
		(document.getElementById(id) as (HTMLElement & { read?: () => unknown }) | null)?.read?.();

	describe('animJointFrame', () => {
		const makeFrame = (overrides: Partial<JointFrameData> = {}): JointFrameData => ({
			x: 10,
			y: 20,
			rotation: 45,
			scaleX: 1.5,
			scaleY: 0.5,
			opacity: 0.8,
			...overrides
		});

		it('onMounted 挂载 sync 桥接到 #animJointFrame-vue-mount 容器', async () => {
			const wrapper = await mountPage('animJointFrame-vue-mount', AnimJointFramePage);
			const el = document.getElementById('animJointFrame-vue-mount') as SyncEl;
			expect(typeof el.sync).toBe('function');
			wrapper.unmount();
		});

		it('sync 桥接把 legacy target 渲染到控件（open 后初始化）', async () => {
			const wrapper = await mountPage('animJointFrame-vue-mount', AnimJointFramePage);
			animJointFrame.target = makeFrame();
			(document.getElementById('animJointFrame-vue-mount') as SyncEl).sync?.();
			await wrapper.vm.$nextTick();
			await wrapper.vm.$nextTick();
			expect(read('animJointFrame-x')).toBe(10);
			expect(read('animJointFrame-y')).toBe(20);
			expect(read('animJointFrame-rotation')).toBe(45);
			expect(read('animJointFrame-scaleX')).toBe(1.5);
			expect(read('animJointFrame-scaleY')).toBe(0.5);
			expect(read('animJointFrame-opacity')).toBe(0.8);
			wrapper.unmount();
		});

		it('控件 input 转发 update 并保持 form 与 target 同步', async () => {
			const wrapper = await mountPage('animJointFrame-vue-mount', AnimJointFramePage);
			animJointFrame.target = makeFrame();
			(document.getElementById('animJointFrame-vue-mount') as SyncEl).sync?.();
			await wrapper.vm.$nextTick();
			await wrapper.vm.$nextTick();
			animJointFrame.update.mockImplementation(() => {
				if (animJointFrame.target) {
					animJointFrame.target.x = 99;
				}
			});
			const input = document.getElementById('animJointFrame-x')?.querySelector('input');
			expect(input).toBeTruthy();
			input!.value = '99';
			input!.dispatchEvent(new Event('input', { bubbles: true }));
			expect(animJointFrame.update).toHaveBeenCalled();
			await wrapper.vm.$nextTick();
			await wrapper.vm.$nextTick();
			expect(read('animJointFrame-x')).toBe(99);
			wrapper.unmount();
		});
	});

	describe('animParticleFrame', () => {
		const makeFrame = (overrides: Partial<ParticleFrameData> = {}): ParticleFrameData => ({
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

		it('onMounted 挂载 sync 桥接到 #animParticleFrame-vue-mount 容器', async () => {
			const wrapper = await mountPage('animParticleFrame-vue-mount', AnimParticleFramePage);
			const el = document.getElementById('animParticleFrame-vue-mount') as SyncEl;
			expect(typeof el.sync).toBe('function');
			wrapper.unmount();
		});

		it('sync 桥接把 legacy target 渲染到控件（open 后初始化）', async () => {
			const wrapper = await mountPage('animParticleFrame-vue-mount', AnimParticleFramePage);
			animParticleFrame.target = makeFrame();
			(document.getElementById('animParticleFrame-vue-mount') as SyncEl).sync?.();
			await wrapper.vm.$nextTick();
			await wrapper.vm.$nextTick();
			expect(read('animParticleFrame-x')).toBe(10);
			expect(read('animParticleFrame-rotation')).toBe(45);
			expect(read('animParticleFrame-scale')).toBe(2);
			expect(read('animParticleFrame-speed')).toBe(3);
			wrapper.unmount();
		});

		it('控件 input 转发 update 并保持 form 与 target 同步', async () => {
			const wrapper = await mountPage('animParticleFrame-vue-mount', AnimParticleFramePage);
			animParticleFrame.target = makeFrame();
			(document.getElementById('animParticleFrame-vue-mount') as SyncEl).sync?.();
			await wrapper.vm.$nextTick();
			await wrapper.vm.$nextTick();
			animParticleFrame.update.mockImplementation(() => {
				if (animParticleFrame.target) {
					animParticleFrame.target.speed = 5;
				}
			});
			const input = document
				.getElementById('animParticleFrame-speed')
				?.querySelector('input');
			expect(input).toBeTruthy();
			input!.value = '5';
			input!.dispatchEvent(new Event('input', { bubbles: true }));
			expect(animParticleFrame.update).toHaveBeenCalled();
			await wrapper.vm.$nextTick();
			await wrapper.vm.$nextTick();
			expect(read('animParticleFrame-speed')).toBe(5);
			wrapper.unmount();
		});
	});

	describe('animSoundFrame', () => {
		const makeFrame = (overrides: Partial<SoundFrameData> = {}): SoundFrameData => ({
			sound: 'bgm.ogg',
			volume: 0.5,
			...overrides
		});

		it('onMounted 挂载 sync 桥接到 #animSoundFrame-vue-mount 容器', async () => {
			const wrapper = await mountPage('animSoundFrame-vue-mount', AnimSoundFramePage);
			const el = document.getElementById('animSoundFrame-vue-mount') as SyncEl;
			expect(typeof el.sync).toBe('function');
			wrapper.unmount();
		});

		it('sync 桥接把 legacy target 渲染到控件（open 后初始化）', async () => {
			const wrapper = await mountPage('animSoundFrame-vue-mount', AnimSoundFramePage);
			animSoundFrame.target = makeFrame();
			(document.getElementById('animSoundFrame-vue-mount') as SyncEl).sync?.();
			await wrapper.vm.$nextTick();
			await wrapper.vm.$nextTick();
			expect(read('animSoundFrame-sound')).toBe('bgm.ogg');
			expect(read('animSoundFrame-volume')).toBe(0.5);
			wrapper.unmount();
		});

		it('控件 input 转发 update 并保持 form 与 target 同步', async () => {
			const wrapper = await mountPage('animSoundFrame-vue-mount', AnimSoundFramePage);
			animSoundFrame.target = makeFrame();
			(document.getElementById('animSoundFrame-vue-mount') as SyncEl).sync?.();
			await wrapper.vm.$nextTick();
			await wrapper.vm.$nextTick();
			animSoundFrame.update.mockImplementation(() => {
				if (animSoundFrame.target) {
					animSoundFrame.target.volume = 0.9;
				}
			});
			const input = document.getElementById('animSoundFrame-volume')?.querySelector('input');
			expect(input).toBeTruthy();
			input!.value = '0.9';
			input!.dispatchEvent(new Event('input', { bubbles: true }));
			expect(animSoundFrame.update).toHaveBeenCalled();
			await wrapper.vm.$nextTick();
			await wrapper.vm.$nextTick();
			expect(read('animSoundFrame-volume')).toBe(0.9);
			wrapper.unmount();
		});
	});
});
