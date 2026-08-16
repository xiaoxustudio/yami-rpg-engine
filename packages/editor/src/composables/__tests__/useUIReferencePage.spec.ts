import { beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent } from 'vue';
import { mount } from '@vue/test-utils';
import { useUIReferencePage } from '@app/composables/useUIReferencePage';

interface ReferenceData {
	prefabId: string;
	synchronous: boolean;
}

const uiReference = vi.hoisted(() => ({
	target: null as ReferenceData | null,
	update: vi.fn()
}));

vi.mock('@/inspector/inspector.ts', () => ({
	Inspector: {
		uiReference,
		getKey: (el: HTMLElement) => el.id.slice(el.id.indexOf('-') + 1)
	}
}));

const Host = defineComponent({
	setup() {
		return useUIReferencePage();
	},
	render: () => null
});

const makeReference = (overrides: Partial<ReferenceData> = {}): ReferenceData => ({
	prefabId: 'aaaaaaaaaaaaaaaa',
	synchronous: true,
	...overrides
});

describe('useUIReferencePage（uiReference inspector 页面 composable）', () => {
	beforeEach(() => {
		document.body.innerHTML = '';
		uiReference.target = null;
		uiReference.update.mockClear();
	});

	const mountPage = () => {
		const wrapper = mount(Host);
		return {
			wrapper,
			page: wrapper.vm as unknown as ReturnType<typeof useUIReferencePage>
		};
	};

	it('sync 从 Inspector.uiReference.target 填充 form', () => {
		const { wrapper, page } = mountPage();
		uiReference.target = makeReference();
		page.sync();
		expect(page.form.prefabId).toBe('aaaaaaaaaaaaaaaa');
		expect(page.form.synchronous).toBe(true);
		wrapper.unmount();
	});

	it('target 为 null 时 sync 不覆盖 form', () => {
		const { wrapper, page } = mountPage();
		uiReference.target = makeReference();
		page.sync();
		uiReference.target = null;
		page.sync();
		expect(page.form.prefabId).toBe('aaaaaaaaaaaaaaaa');
		wrapper.unmount();
	});

	it('onParamInput 找不到 uiReference 控件时跳过 update', () => {
		const { wrapper, page } = mountPage();
		uiReference.target = makeReference();
		const el = document.createElement('input');
		document.body.appendChild(el);
		el.addEventListener('input', (e) => page.onParamInput(e));
		el.dispatchEvent(new Event('input', { bubbles: true }));
		expect(uiReference.update).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('onParamInput 从嵌套元素向上解析控件并调用 update + 重新 sync', () => {
		const { wrapper, page } = mountPage();
		uiReference.update.mockImplementation(
			(target: ReferenceData, key: string, value: unknown) => {
				(target as unknown as Record<string, unknown>)[key] = value;
			}
		);
		uiReference.target = makeReference();
		const el = document.createElement('div') as HTMLElement & { read: () => boolean };
		el.id = 'uiReference-synchronous';
		el.read = () => false;
		const input = document.createElement('input');
		el.appendChild(input);
		document.body.appendChild(el);
		el.addEventListener('input', (e) => page.onParamInput(e));
		input.dispatchEvent(new Event('input', { bubbles: true }));
		expect(uiReference.update).toHaveBeenCalledWith(uiReference.target, 'synchronous', false);
		expect(page.form.synchronous).toBe(false);
		wrapper.unmount();
	});

	it('onParamInput 直接落在控件元素上（prefabId）', () => {
		const { wrapper, page } = mountPage();
		uiReference.target = makeReference();
		const el = document.createElement('div') as HTMLElement & { read: () => string };
		el.id = 'uiReference-prefabId';
		el.read = () => 'bbbbbbbbbbbbbbbb';
		document.body.appendChild(el);
		el.addEventListener('input', (e) => page.onParamInput(e));
		el.dispatchEvent(new Event('input', { bubbles: true }));
		expect(uiReference.update).toHaveBeenCalledWith(
			uiReference.target,
			'prefabId',
			'bbbbbbbbbbbbbbbb'
		);
		wrapper.unmount();
	});
});
