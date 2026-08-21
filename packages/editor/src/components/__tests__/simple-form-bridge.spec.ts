import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import SetQuantity from '@app/components/tools/SetQuantity.vue';
import Rename from '@app/components/tools/Rename.vue';
import SetKey from '@app/components/tools/SetKey.vue';
import SceneShift from '@app/components/tools/SceneShift.vue';
import { Rename as RenameController } from '@app/composables/useRenameWindow';
import { SetKey as SetKeyController } from '@app/composables/useSetKeyWindow';
import { useSetQuantityWindow } from '@app/composables/useSetQuantityWindow';
import { Window } from '@app/tools/window-object.ts';

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ getLabel: () => '', syncState: vi.fn() })
}));

interface FormFrame extends HTMLElement {
	setForm(data: Record<string, unknown>): void;
	getForm(): Record<string, unknown>;
}

const getFrame = (id: string): FormFrame => document.getElementById(id) as unknown as FormFrame;

describe('低频工具窗口表单桥接（P3 表单读写型迁移回归保护）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
	});

	it('rename 经 composable 入口 open/confirm 完整流程（v-model 转发）', async () => {
		const wrapper = mount(Rename, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Window.open = vi.fn();
		Window.close = vi.fn();
		const callback = vi.fn();
		RenameController.open('hello', callback);
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('rename');
		const input = document.getElementById('rename-name') as HTMLElement & {
			input?: HTMLInputElement;
		};
		expect(input?.input?.value).toBe('hello');
		await wrapper.find('input').setValue('world');
		await wrapper.vm.$nextTick();
		getFrame('rename').dispatchEvent(new CustomEvent('confirm'));
		await wrapper.vm.$nextTick();
		expect(callback).toHaveBeenCalledWith('world');
		expect(Window.close).toHaveBeenCalledWith('rename');
		wrapper.unmount();
	});

	it('setKey 经 composable 入口 open/confirm 完整流程（v-model 转发）', async () => {
		const wrapper = mount(SetKey, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Window.open = vi.fn();
		Window.close = vi.fn();
		const callback = vi.fn();
		SetKeyController.open('w', callback);
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('setKey');
		const input = document.getElementById('setKey-key') as HTMLElement & {
			input?: HTMLInputElement;
		};
		expect(input?.input?.value).toBe('w');
		await wrapper.find('input').setValue('a');
		await wrapper.vm.$nextTick();
		getFrame('setKey').dispatchEvent(new CustomEvent('confirm'));
		await wrapper.vm.$nextTick();
		expect(callback).toHaveBeenCalledWith('a');
		expect(Window.close).toHaveBeenCalledWith('setKey');
		wrapper.unmount();
	});

	it('setQuantity 经 composable 入口 open/confirm 完整流程（v-model 转发）', async () => {
		const wrapper = mount(SetQuantity, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Window.open = vi.fn();
		Window.close = vi.fn();
		const callback = vi.fn();
		const ctrl = useSetQuantityWindow();
		ctrl.open(5, 99, callback);
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('setQuantity');
		getFrame('setQuantity').dispatchEvent(new CustomEvent('confirm'));
		await wrapper.vm.$nextTick();
		expect(callback).toHaveBeenCalledWith(5);
		expect(Window.close).toHaveBeenCalledWith('setQuantity');
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
		const setControl = (id: string, value: number): void => {
			const control = document.getElementById(id) as HTMLElement & {
				write(v: unknown): void;
			};
			control.write(value);
		};
		setControl('scene-shift-x', -30);
		setControl('scene-shift-y', 40);
		await wrapper.vm.$nextTick();
		expect(frame.getForm().x).toBe(-30);
		expect(frame.getForm().y).toBe(40);
		wrapper.unmount();
	});
});
