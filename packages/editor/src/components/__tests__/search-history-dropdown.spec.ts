import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import SearchHistoryDropdown from '@app/components/file-browser/SearchHistoryDropdown.vue';
import { BrowserSearchHistory } from '@/module/browserSearchHistory.ts';
import { SettingConfig } from '@/module/settingconfig';

let wrapper: VueWrapper | null = null;

type DropdownVm = { show(input: HTMLInputElement): void };

const vmShow = (input: HTMLInputElement): void => {
	(wrapper!.vm as unknown as DropdownVm).show(input);
};

beforeEach(() => {
	SettingConfig.config.other.browserSearchHistoryLimit = 9;
});

const createInput = (): HTMLInputElement => {
	const input = document.createElement('input');
	Object.defineProperty(input, 'getBoundingClientRect', {
		value: () => ({
			left: 10,
			top: 20,
			right: 210,
			bottom: 40,
			width: 200,
			height: 20,
			x: 10,
			y: 20,
			toJSON: () => ({})
		}),
		configurable: true
	});
	document.body.appendChild(input);
	return input;
};

const dropdownEl = (): HTMLElement | null =>
	document.querySelector('.browser-search-history-dropdown');

const mountDropdown = async (): Promise<VueWrapper> => {
	wrapper = mount(SearchHistoryDropdown, { attachTo: document.body });
	await wrapper.vm.$nextTick();
	return wrapper;
};

afterEach(() => {
	wrapper?.unmount();
	wrapper = null;
	BrowserSearchHistory.histories.length = 0;
	document.querySelectorAll('.browser-search-history-dropdown').forEach((el) => el.remove());
	document.querySelectorAll('input').forEach((el) => el.remove());
});

describe('搜索历史下拉 Vue 渲染（绝对定位 popup 语义回归保护）', () => {
	it('show 渲染历史条目并保留绝对定位语义', async () => {
		BrowserSearchHistory.add!('keyword1');
		BrowserSearchHistory.add!('keyword2');
		const input = createInput();
		await mountDropdown();
		vmShow(input);
		await wrapper!.vm.$nextTick();
		const dropdown = dropdownEl();
		expect(dropdown).toBeTruthy();
		if (!dropdown) return;
		expect(dropdown.style.position).toBe('absolute');
		expect(dropdown.style.zIndex).toBe('9999');
		expect(dropdown.style.left).toBe('10px');
		expect(dropdown.style.top).toBe('40px');
		expect(dropdown.style.width).toBe('200px');
		const items = dropdown.querySelectorAll('.browser-search-item');
		expect(items.length).toBe(2);
		expect(items[0].textContent).toContain('keyword2');
		expect(items[1].textContent).toContain('keyword1');
	});

	it('点击条目回填输入并隐藏下拉', async () => {
		BrowserSearchHistory.add!('keyword1');
		const input = createInput();
		await mountDropdown();
		vmShow(input);
		await wrapper!.vm.$nextTick();
		const item = dropdownEl()!.querySelector('.browser-search-item') as HTMLElement;
		item.dispatchEvent(new MouseEvent('click', { bubbles: true }));
		await wrapper!.vm.$nextTick();
		expect(input.value).toBe('keyword1');
		expect(dropdownEl()!.style.display).toBe('none');
	});

	it('删除按钮移除条目并刷新下拉', async () => {
		BrowserSearchHistory.add!('keyword1');
		BrowserSearchHistory.add!('keyword2');
		const input = createInput();
		await mountDropdown();
		vmShow(input);
		await wrapper!.vm.$nextTick();
		const first = dropdownEl()!.querySelector('.browser-search-item') as HTMLElement;
		const deleteButton = first.querySelector('.browser-search-delete-button') as HTMLElement;
		deleteButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
		await wrapper!.vm.$nextTick();
		expect(BrowserSearchHistory.histories).not.toContain('keyword2');
		const items = dropdownEl()!.querySelectorAll('.browser-search-item');
		expect(items.length).toBe(1);
		expect(items[0].textContent).toContain('keyword1');
	});

	it('无历史时 show 保持隐藏', async () => {
		const input = createInput();
		await mountDropdown();
		vmShow(input);
		await wrapper!.vm.$nextTick();
		expect(dropdownEl()!.style.display).toBe('none');
	});
});
