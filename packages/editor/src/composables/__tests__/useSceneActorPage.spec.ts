import { beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent } from 'vue';
import { mount } from '@vue/test-utils';
import { useSceneActorPage } from '@app/composables/useSceneActorPage';

interface ActorData {
	name: string;
	type: string;
	actorId: string;
	teamId: string;
	x: number;
	y: number;
	angle: number;
	scale: number;
}

const sceneActor = vi.hoisted(() => ({
	target: null as ActorData | null,
	update: vi.fn()
}));

vi.mock('@/inspector/inspector.ts', () => ({
	Inspector: {
		sceneActor,
		getKey: (el: HTMLElement) => el.id.slice(el.id.indexOf('-') + 1)
	}
}));

const Host = defineComponent({
	setup() {
		return useSceneActorPage();
	},
	render: () => null
});

const makeActor = (overrides: Partial<ActorData> = {}): ActorData => ({
	name: 'Actor 1',
	type: 'local',
	actorId: 'actor-1',
	teamId: 'team-1',
	x: 10,
	y: 20,
	angle: 45,
	scale: 1,
	...overrides
});

describe('useSceneActorPage（sceneActor inspector 页面 composable）', () => {
	beforeEach(() => {
		document.body.innerHTML = '';
		sceneActor.target = null;
		sceneActor.update.mockClear();
	});

	const mountPage = () => {
		const wrapper = mount(Host);
		return {
			wrapper,
			page: wrapper.vm as unknown as ReturnType<typeof useSceneActorPage>
		};
	};

	it('sync 从 Inspector.sceneActor.target 填充 form', () => {
		const { wrapper, page } = mountPage();
		sceneActor.target = makeActor();
		page.sync();
		expect(page.form.name).toBe('Actor 1');
		expect(page.form.type).toBe('local');
		expect(page.form.actorId).toBe('actor-1');
		expect(page.form.teamId).toBe('team-1');
		expect(page.form.x).toBe(10);
		expect(page.form.y).toBe(20);
		expect(page.form.angle).toBe(45);
		expect(page.form.scale).toBe(1);
		wrapper.unmount();
	});

	it('target 为 null 时 sync 不覆盖 form', () => {
		const { wrapper, page } = mountPage();
		sceneActor.target = makeActor();
		page.sync();
		sceneActor.target = null;
		page.sync();
		expect(page.form.name).toBe('Actor 1');
		expect(page.form.scale).toBe(1);
		wrapper.unmount();
	});

	it('onParamInput 找不到 sceneActor 控件时跳过 update', () => {
		const { wrapper, page } = mountPage();
		sceneActor.target = makeActor();
		const el = document.createElement('input');
		document.body.appendChild(el);
		el.addEventListener('input', (e) => page.onParamInput(e));
		el.dispatchEvent(new Event('input', { bubbles: true }));
		expect(sceneActor.update).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('onParamInput 从嵌套元素向上解析控件并调用 update + 重新 sync', () => {
		const { wrapper, page } = mountPage();
		sceneActor.update.mockImplementation((actor: ActorData, key: string, value: unknown) => {
			(actor as unknown as Record<string, unknown>)[key] = value;
		});
		sceneActor.target = makeActor();
		const el = document.createElement('div') as HTMLElement & { read: () => string };
		el.id = 'sceneActor-name';
		el.read = () => 'Actor 3';
		const input = document.createElement('input');
		el.appendChild(input);
		document.body.appendChild(el);
		el.addEventListener('input', (e) => page.onParamInput(e));
		input.dispatchEvent(new Event('input', { bubbles: true }));
		expect(sceneActor.update).toHaveBeenCalledWith(sceneActor.target, 'name', 'Actor 3');
		expect(page.form.name).toBe('Actor 3');
		wrapper.unmount();
	});

	it('onParamInput 直接落在控件元素上', () => {
		const { wrapper, page } = mountPage();
		sceneActor.target = makeActor();
		const el = document.createElement('div') as HTMLElement & { read: () => number };
		el.id = 'sceneActor-angle';
		el.read = () => 90;
		document.body.appendChild(el);
		el.addEventListener('input', (e) => page.onParamInput(e));
		el.dispatchEvent(new Event('input', { bubbles: true }));
		expect(sceneActor.update).toHaveBeenCalledWith(sceneActor.target, 'angle', 90);
		wrapper.unmount();
	});
});
