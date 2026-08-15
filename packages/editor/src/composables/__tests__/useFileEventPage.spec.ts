import { beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent } from 'vue';
import { mount } from '@vue/test-utils';
import { useFileEventPage } from '@app/composables/useFileEventPage';

interface EventData {
	type: string;
	enabled: boolean;
	priority: boolean;
	namespace: boolean;
	returnType: string;
	description: string;
}

const fileEvent = vi.hoisted(() => ({
	target: null as EventData | null,
	update: vi.fn()
}));

vi.mock('@/inspector/inspector.ts', () => ({
	Inspector: {
		fileEvent,
		getKey: (el: HTMLElement) => el.id.slice(el.id.indexOf('-') + 1)
	}
}));

const Host = defineComponent({
	setup() {
		return useFileEventPage();
	},
	render: () => null
});

const makeEvent = (overrides: Partial<EventData> = {}): EventData => ({
	type: 'common',
	enabled: true,
	priority: false,
	namespace: true,
	returnType: 'none',
	description: '',
	...overrides
});

describe('useFileEventPage（fileEvent inspector 页面 composable）', () => {
	beforeEach(() => {
		document.body.innerHTML = '';
		fileEvent.target = null;
		fileEvent.update.mockClear();
	});

	const mountPage = () => {
		const wrapper = mount(Host);
		return {
			wrapper,
			page: wrapper.vm as unknown as ReturnType<typeof useFileEventPage>
		};
	};

	it('sync 从 Inspector.fileEvent.target 填充 form', () => {
		const { wrapper, page } = mountPage();
		fileEvent.target = makeEvent();
		page.sync();
		expect(page.form.type).toBe('common');
		expect(page.form.enabled).toBe(true);
		expect(page.form.priority).toBe(false);
		expect(page.form.namespace).toBe(true);
		expect(page.form.returnType).toBe('none');
		expect(page.form.description).toBe('');
		wrapper.unmount();
	});

	it('target 为 null 时 sync 不覆盖 form', () => {
		const { wrapper, page } = mountPage();
		fileEvent.target = makeEvent();
		page.sync();
		fileEvent.target = null;
		page.sync();
		expect(page.form.type).toBe('common');
		expect(page.form.description).toBe('');
		wrapper.unmount();
	});

	it('onParamInput 找不到 fileEvent 控件时跳过 update', () => {
		const { wrapper, page } = mountPage();
		fileEvent.target = makeEvent();
		const el = document.createElement('input');
		document.body.appendChild(el);
		el.addEventListener('input', (e) => page.onParamInput(e));
		el.dispatchEvent(new Event('input', { bubbles: true }));
		expect(fileEvent.update).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('onParamInput 从嵌套元素向上解析控件并调用 update + 重新 sync', () => {
		const { wrapper, page } = mountPage();
		fileEvent.update.mockImplementation((event: EventData, key: string, value: unknown) => {
			(event as unknown as Record<string, unknown>)[key] = value;
		});
		fileEvent.target = makeEvent();
		const el = document.createElement('div') as HTMLElement & { read: () => string };
		el.id = 'fileEvent-returnType';
		el.read = () => 'string';
		const input = document.createElement('input');
		el.appendChild(input);
		document.body.appendChild(el);
		el.addEventListener('input', (e) => page.onParamInput(e));
		input.dispatchEvent(new Event('input', { bubbles: true }));
		expect(fileEvent.update).toHaveBeenCalledWith(fileEvent.target, 'returnType', 'string');
		expect(page.form.returnType).toBe('string');
		wrapper.unmount();
	});

	it('onParamInput 直接落在控件元素上', () => {
		const { wrapper, page } = mountPage();
		fileEvent.target = makeEvent();
		const el = document.createElement('div') as HTMLElement & { read: () => boolean };
		el.id = 'fileEvent-enabled';
		el.read = () => false;
		document.body.appendChild(el);
		el.addEventListener('input', (e) => page.onParamInput(e));
		el.dispatchEvent(new Event('input', { bubbles: true }));
		expect(fileEvent.update).toHaveBeenCalledWith(fileEvent.target, 'enabled', false);
		wrapper.unmount();
	});
});
