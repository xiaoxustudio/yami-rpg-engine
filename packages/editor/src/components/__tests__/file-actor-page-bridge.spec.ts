import { beforeEach, describe, expect, it, vi } from 'vitest';
import { registerElement } from '@app/utils/element-registry';
import { inspectorEls } from '@app/inspector/element-registry.ts';
import { mount } from '@vue/test-utils';
import { initYamiI18n } from '@app/i18n';
import FileActorPage from '@app/components/inspector/FileActorPage.vue';

interface ActorData {
	portrait: string;
	clip: number[];
	animationId: string;
	idleMotion: string;
	moveMotion: string;
	rotatable: boolean;
	passage: string;
	speed: number;
	shape: string;
	size: number;
	weight: number;
	immovable: boolean;
	scale: number;
	priority: number;
	inherit: string;
}

const fileActor = vi.hoisted(() => ({
	target: null as ActorData | null,
	update: vi.fn(),
	animationIdWrite: vi.fn(),
	listChange: vi.fn()
}));

vi.mock('@app/inspector/inspector.ts', () => ({
	Inspector: {
		fileActor,
		getKey: (el: HTMLElement) => el.id.slice(el.id.indexOf('-') + 1)
	}
}));

vi.mock('@app/stores/inspector', () => ({
	useInspectorStore: () => ({ syncState: vi.fn() })
}));

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ syncState: vi.fn() })
}));

type SyncEl = HTMLElement & { sync?: () => void };

describe('FileActorPage（fileActor inspector 响应式双向绑定桥接）', () => {
	beforeEach(() => {
		document.body.innerHTML = '';
		fileActor.target = null;
		fileActor.update.mockClear();
	});

	const mountPage = async () => {
		const host = document.createElement('div');
		host.id = 'fileActor-vue-mount';
		document.body.appendChild(host);
		// 页面 SFC 改从 inspectorEls 取宿主容器 → 用例自建的宿主也要登记
		registerElement(inspectorEls, host.id, host);
		const wrapper = mount(FileActorPage, {
			attachTo: document.body,
			global: { plugins: [initYamiI18n()] }
		});
		await wrapper.vm.$nextTick();
		await wrapper.vm.$nextTick();
		return wrapper;
	};

	const makeActor = (overrides: Partial<ActorData> = {}): ActorData => ({
		portrait: '',
		clip: [0, 0, 64, 64],
		animationId: 'anim-1',
		idleMotion: 'idle',
		moveMotion: 'walk',
		rotatable: false,
		passage: 'land',
		speed: 4,
		shape: 'circle',
		size: 0.8,
		weight: 1,
		immovable: true,
		scale: 1,
		priority: 0,
		inherit: '',
		...overrides
	});

	const read = (id: string) =>
		(document.getElementById(id) as (HTMLElement & { read?: () => unknown }) | null)?.read?.();

	it('onMounted 挂载 sync 桥接到 #fileActor-vue-mount 容器', async () => {
		const wrapper = await mountPage();
		const el = document.getElementById('fileActor-vue-mount') as SyncEl;
		expect(typeof el.sync).toBe('function');
		wrapper.unmount();
	});

	it('sync 桥接把 legacy target 渲染到控件（open 后初始化）', async () => {
		const wrapper = await mountPage();
		fileActor.target = makeActor();
		(document.getElementById('fileActor-vue-mount') as SyncEl).sync?.();
		await wrapper.vm.$nextTick();
		await wrapper.vm.$nextTick();
		expect(read('fileActor-portrait')).toBe('');
		expect(read('fileActor-animationId')).toBe('anim-1');
		expect(read('fileActor-idleMotion')).toBe('idle');
		expect(read('fileActor-moveMotion')).toBe('walk');
		expect(read('fileActor-rotatable')).toBe(false);
		expect(read('fileActor-passage')).toBe('land');
		expect(read('fileActor-speed')).toBe(4);
		expect(read('fileActor-shape')).toBe('circle');
		expect(read('fileActor-size')).toBe(0.8);
		expect(read('fileActor-weight')).toBe(1);
		expect(read('fileActor-immovable')).toBe(true);
		expect(read('fileActor-scale')).toBe(1);
		expect(read('fileActor-priority')).toBe(0);
		wrapper.unmount();
	});

	it('切换 target 后再次 sync 更新控件显示', async () => {
		const wrapper = await mountPage();
		const el = document.getElementById('fileActor-vue-mount') as SyncEl;
		fileActor.target = makeActor();
		el.sync?.();
		await wrapper.vm.$nextTick();
		await wrapper.vm.$nextTick();
		fileActor.target = makeActor({ portrait: 'portrait-2', speed: 9, passage: 'water' });
		el.sync?.();
		await wrapper.vm.$nextTick();
		await wrapper.vm.$nextTick();
		expect(read('fileActor-portrait')).toBe('portrait-2');
		expect(read('fileActor-speed')).toBe(9);
		expect(read('fileActor-passage')).toBe('water');
		wrapper.unmount();
	});

	it('控件 input 转发 update 并保持 form 与 target 同步', async () => {
		const wrapper = await mountPage();
		const el = document.getElementById('fileActor-vue-mount') as SyncEl;
		fileActor.target = makeActor();
		el.sync?.();
		await wrapper.vm.$nextTick();
		await wrapper.vm.$nextTick();
		fileActor.update.mockImplementation((actor: ActorData, key: string, value: unknown) => {
			(actor as unknown as Record<string, unknown>)[key] = value;
		});
		const input = document.getElementById('fileActor-speed')?.querySelector('input');
		expect(input).toBeTruthy();
		input!.value = '6';
		input!.dispatchEvent(new Event('input', { bubbles: true }));
		expect(fileActor.update).toHaveBeenCalled();
		await wrapper.vm.$nextTick();
		expect(read('fileActor-speed')).toBe(6);
		wrapper.unmount();
	});
});
