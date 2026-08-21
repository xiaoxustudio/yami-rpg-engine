import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import SetQuantity from '@app/components/tools/SetQuantity.vue';
import Rename from '@app/components/tools/Rename.vue';
import SetKey from '@app/components/tools/SetKey.vue';
import Zoom from '@app/components/tools/Zoom.vue';
import SceneShift from '@app/components/tools/SceneShift.vue';
import { Rename as RenameController } from '@app/composables/useRenameWindow';
import { SetKey as SetKeyController } from '@app/composables/useSetKeyWindow';
import { Window } from '@app/tools/window-object.ts';

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ getLabel: () => '', syncState: vi.fn() })
}));

interface FormFrame extends HTMLElement {
	setForm(data: Record<string, unknown>): void;
	getForm(): Record<string, unknown>;
}

interface ControlEl extends HTMLElement {
	input: HTMLInputElement;
	read(): unknown;
	write(value: unknown): void;
}

const getFrame = (id: string): FormFrame => document.getElementById(id) as unknown as FormFrame;

const getControl = (id: string): ControlEl => document.getElementById(id) as unknown as ControlEl;

describe('低频工具窗口表单桥接（P3 表单读写型迁移回归保护）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
	});

	it('setQuantity 根元素暴露 setForm/getForm，setForm 写入控件 DOM 与 max', async () => {
		const wrapper = mount(SetQuantity, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const frame = getFrame('setQuantity');
		expect(typeof frame.setForm).toBe('function');
		expect(typeof frame.getForm).toBe('function');
		frame.setForm({ quantity: 5, max: 99 });
		await wrapper.vm.$nextTick();
		expect(frame.getForm().quantity).toBe(5);
		expect(getControl('setQuantity-quantity').read()).toBe(5);
		expect(getControl('setQuantity-quantity').input.max).toBe('99');
		wrapper.unmount();
	});

	it('setQuantity 控件值变更在 getForm 时读回', async () => {
		const wrapper = mount(SetQuantity, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const frame = getFrame('setQuantity');
		frame.setForm({ max: 100 });
		getControl('setQuantity-quantity').write(42);
		await wrapper.vm.$nextTick();
		expect(frame.getForm().quantity).toBe(42);
		wrapper.unmount();
	});

	it('rename 根元素暴露 setForm/getForm，setForm 写入控件 DOM', async () => {
		const wrapper = mount(Rename, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const frame = getFrame('rename');
		expect(typeof frame.setForm).toBe('function');
		expect(typeof frame.getForm).toBe('function');
		frame.setForm({ name: 'hello' });
		await wrapper.vm.$nextTick();
		expect(frame.getForm().name).toBe('hello');
		expect(getControl('rename-name').read()).toBe('hello');
		wrapper.unmount();
	});

	it('rename 经 legacy 入口 open/confirm 完整流程（composable 转发）', async () => {
		const wrapper = mount(Rename, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Window.open = vi.fn();
		Window.close = vi.fn();
		const callback = vi.fn();
		RenameController.open('hello', callback);
		expect(Window.open).toHaveBeenCalledWith('rename');
		expect(getFrame('rename').getForm().name).toBe('hello');
		getControl('rename-name').write('world');
		getFrame('rename').dispatchEvent(new CustomEvent('confirm'));
		await wrapper.vm.$nextTick();
		expect(callback).toHaveBeenCalledWith('world');
		expect(Window.close).toHaveBeenCalledWith('rename');
		wrapper.unmount();
	});

	it('rename 控件值变更在 getForm 时读回', async () => {
		const wrapper = mount(Rename, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const frame = getFrame('rename');
		getControl('rename-name').write('world');
		await wrapper.vm.$nextTick();
		expect(frame.getForm().name).toBe('world');
		wrapper.unmount();
	});

	it('setKey 根元素暴露 setForm/getForm，控件值变更在 getForm 时读回', async () => {
		const wrapper = mount(SetKey, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const frame = getFrame('setKey');
		expect(typeof frame.setForm).toBe('function');
		expect(typeof frame.getForm).toBe('function');
		frame.setForm({ key: 'w' });
		await wrapper.vm.$nextTick();
		expect(frame.getForm().key).toBe('w');
		getControl('setKey-key').write('a');
		await wrapper.vm.$nextTick();
		expect(frame.getForm().key).toBe('a');
		wrapper.unmount();
	});

	it('setKey 经 legacy 入口 open/confirm 完整流程（composable 转发）', async () => {
		const wrapper = mount(SetKey, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Window.open = vi.fn();
		Window.close = vi.fn();
		const callback = vi.fn();
		SetKeyController.open('w', callback);
		expect(Window.open).toHaveBeenCalledWith('setKey');
		expect(getFrame('setKey').getForm().key).toBe('w');
		getControl('setKey-key').write('a');
		getFrame('setKey').dispatchEvent(new CustomEvent('confirm'));
		await wrapper.vm.$nextTick();
		expect(callback).toHaveBeenCalledWith('a');
		expect(Window.close).toHaveBeenCalledWith('setKey');
		wrapper.unmount();
	});

	it('zoom 根元素暴露 setForm/getForm，setForm 写入控件 DOM', async () => {
		const wrapper = mount(Zoom, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const frame = getFrame('zoom');
		expect(typeof frame.setForm).toBe('function');
		expect(typeof frame.getForm).toBe('function');
		frame.setForm({ factor: 1.5 });
		await wrapper.vm.$nextTick();
		expect(frame.getForm().factor).toBe(1.5);
		expect(getControl('zoom-factor').read()).toBe(1.5);
		wrapper.unmount();
	});

	it('scene-shift 根元素暴露 setForm/getForm，控件值变更在 getForm 时读回', async () => {
		const wrapper = mount(SceneShift, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const frame = getFrame('scene-shift');
		expect(typeof frame.setForm).toBe('function');
		expect(typeof frame.getForm).toBe('function');
		frame.setForm({ x: 10, y: 20 });
		await wrapper.vm.$nextTick();
		expect(frame.getForm().x).toBe(10);
		expect(frame.getForm().y).toBe(20);
		getControl('scene-shift-x').write(-30);
		getControl('scene-shift-y').write(40);
		await wrapper.vm.$nextTick();
		expect(frame.getForm().x).toBe(-30);
		expect(frame.getForm().y).toBe(40);
		wrapper.unmount();
	});
});
