import { beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent } from 'vue';
import { mount } from '@vue/test-utils';
import { useFileActorPage } from '@app/composables/useFileActorPage';

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
	update: vi.fn()
}));

vi.mock('@app/inspector/inspector.ts', () => ({
	Inspector: {
		fileActor,
		getKey: (el: HTMLElement) => el.id.slice(el.id.indexOf('-') + 1)
	}
}));

const Host = defineComponent({
	setup() {
		return useFileActorPage();
	},
	render: () => null
});

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

describe('useFileActorPage（fileActor inspector 页面 composable）', () => {
	beforeEach(() => {
		document.body.innerHTML = '';
		fileActor.target = null;
		fileActor.update.mockClear();
	});

	const mountPage = () => {
		const wrapper = mount(Host);
		return {
			wrapper,
			page: wrapper.vm as unknown as ReturnType<typeof useFileActorPage>
		};
	};

	it('sync 从 Inspector.fileActor.target 填充 form', () => {
		const { wrapper, page } = mountPage();
		fileActor.target = makeActor();
		page.sync();
		expect(page.form.portrait).toBe('');
		expect(page.form.clip).toEqual([0, 0, 64, 64]);
		expect(page.form.animationId).toBe('anim-1');
		expect(page.form.idleMotion).toBe('idle');
		expect(page.form.moveMotion).toBe('walk');
		expect(page.form.rotatable).toBe(false);
		expect(page.form.passage).toBe('land');
		expect(page.form.speed).toBe(4);
		expect(page.form.shape).toBe('circle');
		expect(page.form.size).toBe(0.8);
		expect(page.form.weight).toBe(1);
		expect(page.form.immovable).toBe(true);
		expect(page.form.scale).toBe(1);
		expect(page.form.priority).toBe(0);
		expect(page.form.inherit).toBe('');
		wrapper.unmount();
	});

	it('target 为 null 时 sync 不覆盖 form', () => {
		const { wrapper, page } = mountPage();
		fileActor.target = makeActor();
		page.sync();
		fileActor.target = null;
		page.sync();
		expect(page.form.animationId).toBe('anim-1');
		expect(page.form.speed).toBe(4);
		wrapper.unmount();
	});

	it('onParamInput 找不到 fileActor 控件时跳过 update', () => {
		const { wrapper, page } = mountPage();
		fileActor.target = makeActor();
		const el = document.createElement('input');
		document.body.appendChild(el);
		el.addEventListener('input', (e) => page.onParamInput(e));
		el.dispatchEvent(new Event('input', { bubbles: true }));
		expect(fileActor.update).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('onParamInput 从嵌套元素向上解析控件并调用 update + 重新 sync', () => {
		const { wrapper, page } = mountPage();
		fileActor.update.mockImplementation((actor: ActorData, key: string, value: unknown) => {
			(actor as unknown as Record<string, unknown>)[key] = value;
		});
		fileActor.target = makeActor();
		const el = document.createElement('div') as HTMLElement & { read: () => string };
		el.id = 'fileActor-passage';
		el.read = () => 'water';
		const input = document.createElement('input');
		el.appendChild(input);
		document.body.appendChild(el);
		el.addEventListener('input', (e) => page.onParamInput(e));
		input.dispatchEvent(new Event('input', { bubbles: true }));
		expect(fileActor.update).toHaveBeenCalledWith(fileActor.target, 'passage', 'water');
		expect(page.form.passage).toBe('water');
		wrapper.unmount();
	});

	it('onParamInput 直接落在控件元素上', () => {
		const { wrapper, page } = mountPage();
		fileActor.target = makeActor();
		const el = document.createElement('div') as HTMLElement & { read: () => number };
		el.id = 'fileActor-speed';
		el.read = () => 6;
		document.body.appendChild(el);
		el.addEventListener('input', (e) => page.onParamInput(e));
		el.dispatchEvent(new Event('input', { bubbles: true }));
		expect(fileActor.update).toHaveBeenCalledWith(fileActor.target, 'speed', 6);
		wrapper.unmount();
	});
});
