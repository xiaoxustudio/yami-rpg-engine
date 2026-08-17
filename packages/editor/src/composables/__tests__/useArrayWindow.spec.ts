import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import ArrayList from '@app/components/tools/ArrayList.vue';
import ArrayListNumber from '@app/components/tools/ArrayListNumber.vue';
import ArrayListString from '@app/components/tools/ArrayListString.vue';
import { useArrayWindow } from '@app/composables/useArrayWindow';
import { Window } from '@app/legacy/tools/window-object.ts';
import { ArrayList as ArrayListController } from '@app/legacy/tools/array-window.ts';
import '@app/legacy/util/number.ts';

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ getLabel: () => '', syncState: vi.fn() })
}));

interface FormFrame extends HTMLElement {
	setForm(data: Record<string, unknown>): void;
	getForm(): Record<string, unknown>;
}

interface ControlEl extends HTMLElement {
	write(value: unknown): void;
	read(): unknown;
	bind(object: unknown): void;
}

const getFrame = (id: string): FormFrame => document.getElementById(id) as unknown as FormFrame;

const getControl = (id: string): ControlEl => document.getElementById(id) as unknown as ControlEl;

const bindList = (): void => {
	getControl('arrayList-list').bind({
		initialize: () => undefined,
		parse: (item: unknown) => String(item),
		open: () => undefined,
		save: () => undefined
	});
};

describe('useArrayWindow（数组窗口 composable：form 状态 + open/confirm/子窗口）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
		Window.confirm = vi.fn();
	});

	it('open 打开窗口、填充列表控件与 form 并写入回调', async () => {
		const wrapper = mount(ArrayList, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		bindList();
		const arrayWindow = useArrayWindow();
		const callback = vi.fn();
		arrayWindow.open([1, 2, 3], callback);
		expect(Window.open).toHaveBeenCalledWith('arrayList');
		expect(arrayWindow.form.values).toEqual([1, 2, 3]);
		expect(getFrame('arrayList').getForm().values).toEqual([1, 2, 3]);
		expect(getControl('arrayList-list').read()).toEqual([1, 2, 3]);
		wrapper.unmount();
	});

	it('confirm 经 getForm 读回列表回调并关闭窗口，changed 重置', async () => {
		const wrapper = mount(ArrayList, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		bindList();
		const arrayWindow = useArrayWindow();
		const callback = vi.fn();
		arrayWindow.open([1, 2, 3], callback);
		arrayWindow.markChanged();
		getControl('arrayList-list').write([7, 8]);
		arrayWindow.confirm();
		expect(callback).toHaveBeenCalledWith([7, 8]);
		expect(Window.close).toHaveBeenCalledWith('arrayList');
		expect(arrayWindow.changed).toBe(false);
		wrapper.unmount();
	});

	it('markChanged 后 onWindowClose 阻止关闭并弹确认，确认后关闭', async () => {
		const wrapper = mount(ArrayList, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		bindList();
		const arrayWindow = useArrayWindow();
		arrayWindow.open([1], vi.fn());
		arrayWindow.markChanged();
		const event = new Event('close', { cancelable: true });
		arrayWindow.onWindowClose(event);
		expect(event.defaultPrevented).toBe(true);
		expect(Window.confirm).toHaveBeenCalled();
		const items = (Window.confirm as ReturnType<typeof vi.fn>).mock.calls[0][1];
		items[0].click();
		expect(Window.close).toHaveBeenCalledWith('arrayList');
		expect(arrayWindow.changed).toBe(false);
		wrapper.unmount();
	});

	it('openNumber/confirmNumber 子窗口表单往返', async () => {
		const wrapper = mount(ArrayListNumber, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const arrayWindow = useArrayWindow();
		arrayWindow.openNumber(42);
		expect(Window.open).toHaveBeenCalledWith('arrayList-number');
		expect(getFrame('arrayList-number').getForm().value).toBe(42);
		expect(getControl('arrayList-number-value').read()).toBe(42);
		getControl('arrayList-number-value').write(99);
		expect(arrayWindow.confirmNumber()).toBe(99);
		expect(Window.close).toHaveBeenCalledWith('arrayList-number');
		wrapper.unmount();
	});

	it('openString/confirmString 子窗口表单往返', async () => {
		const wrapper = mount(ArrayListString, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const arrayWindow = useArrayWindow();
		arrayWindow.openString('hello');
		expect(Window.open).toHaveBeenCalledWith('arrayList-string');
		expect(getFrame('arrayList-string').getForm().value).toBe('hello');
		getControl('arrayList-string-value').write('world');
		expect(arrayWindow.confirmString()).toBe('world');
		expect(Window.close).toHaveBeenCalledWith('arrayList-string');
		wrapper.unmount();
	});

	it('closed 事件清除回调，后续 confirm 不再触发', async () => {
		const wrapper = mount(ArrayList, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		bindList();
		const arrayWindow = useArrayWindow();
		const callback = vi.fn();
		arrayWindow.open([1], callback);
		getFrame('arrayList').dispatchEvent(new CustomEvent('closed'));
		arrayWindow.confirm();
		expect(callback).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('legacy ArrayList.open/confirm 转发 composable 并回调 target.input', async () => {
		const wrappers = [
			mount(ArrayList, { attachTo: document.body }),
			mount(ArrayListNumber, { attachTo: document.body }),
			mount(ArrayListString, { attachTo: document.body })
		];
		await Promise.all(wrappers.map((w) => w.vm.$nextTick()));
		ArrayListController.initialize!(document.getElementById('arrayList-list') as HTMLElement);
		const container = document.createElement('div');
		const label = document.createElement('div');
		label.textContent = 'Items';
		container.appendChild(label);
		const target = document.createElement('div') as unknown as {
			filter: string;
			read(): unknown;
			input: (value: unknown) => void;
		};
		target.filter = 'number';
		target.read = () => [1, 2, 3];
		target.input = vi.fn();
		container.appendChild(target as unknown as Node);
		ArrayListController.open!(target as never);
		expect(Window.open).toHaveBeenCalledWith('arrayList');
		expect(getControl('arrayList-list').read()).toEqual([1, 2, 3]);
		getControl('arrayList-list').write([5, 6]);
		ArrayListController.confirm!({} as Event);
		expect(target.input).toHaveBeenCalledWith([5, 6]);
		expect(Window.close).toHaveBeenCalledWith('arrayList');
		wrappers.forEach((w) => w.unmount());
	});
});
