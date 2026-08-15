import { beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent } from 'vue';
import { mount } from '@vue/test-utils';
import { useFileItemPage } from '@app/composables/useFileItemPage';

interface EntityData {
	icon: string;
	clip: number[];
	inherit: string;
}

const fileItem = vi.hoisted(() => ({
	target: null as EntityData | null,
	update: vi.fn()
}));

vi.mock('@/inspector/inspector.ts', () => ({
	Inspector: {
		fileItem,
		getKey: (el: HTMLElement) => el.id.slice(el.id.indexOf('-') + 1)
	}
}));

const Host = defineComponent({
	setup() {
		return useFileItemPage();
	},
	render: () => null
});

const makeItem = (overrides: Partial<EntityData> = {}): EntityData => ({
	icon: 'icon-1',
	clip: [0, 0, 32, 32],
	inherit: '',
	...overrides
});

describe('useFileItemPage（fileItem inspector 页面 composable）', () => {
	beforeEach(() => {
		document.body.innerHTML = '';
		fileItem.target = null;
		fileItem.update.mockClear();
	});

	const mountPage = () => {
		const wrapper = mount(Host);
		return {
			wrapper,
			page: wrapper.vm as unknown as ReturnType<typeof useFileItemPage>
		};
	};

	it('sync 从 Inspector.fileItem.target 填充 form', () => {
		const { wrapper, page } = mountPage();
		fileItem.target = makeItem();
		page.sync();
		expect(page.form.icon).toBe('icon-1');
		expect(page.form.clip).toEqual([0, 0, 32, 32]);
		expect(page.form.inherit).toBe('');
		wrapper.unmount();
	});

	it('target 为 null 时 sync 不覆盖 form', () => {
		const { wrapper, page } = mountPage();
		fileItem.target = makeItem();
		page.sync();
		fileItem.target = null;
		page.sync();
		expect(page.form.icon).toBe('icon-1');
		expect(page.form.clip).toEqual([0, 0, 32, 32]);
		wrapper.unmount();
	});

	it('onParamInput 找不到 fileItem 控件时跳过 update', () => {
		const { wrapper, page } = mountPage();
		fileItem.target = makeItem();
		const el = document.createElement('input');
		document.body.appendChild(el);
		el.addEventListener('input', (e) => page.onParamInput(e));
		el.dispatchEvent(new Event('input', { bubbles: true }));
		expect(fileItem.update).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('onParamInput 从嵌套元素向上解析控件并调用 update + 重新 sync', () => {
		const { wrapper, page } = mountPage();
		fileItem.update.mockImplementation((item: EntityData, key: string, value: unknown) => {
			(item as unknown as Record<string, unknown>)[key] = value;
		});
		fileItem.target = makeItem();
		const el = document.createElement('div') as HTMLElement & { read: () => string };
		el.id = 'fileItem-inherit';
		el.read = () => 'item-2';
		const input = document.createElement('input');
		el.appendChild(input);
		document.body.appendChild(el);
		el.addEventListener('input', (e) => page.onParamInput(e));
		input.dispatchEvent(new Event('input', { bubbles: true }));
		expect(fileItem.update).toHaveBeenCalledWith(fileItem.target, 'inherit', 'item-2');
		expect(page.form.inherit).toBe('item-2');
		wrapper.unmount();
	});

	it('onParamInput 直接落在控件元素上', () => {
		const { wrapper, page } = mountPage();
		fileItem.target = makeItem();
		const el = document.createElement('div') as HTMLElement & { read: () => string };
		el.id = 'fileItem-icon';
		el.read = () => 'icon-2';
		document.body.appendChild(el);
		el.addEventListener('input', (e) => page.onParamInput(e));
		el.dispatchEvent(new Event('input', { bubbles: true }));
		expect(fileItem.update).toHaveBeenCalledWith(fileItem.target, 'icon', 'icon-2');
		wrapper.unmount();
	});
});
