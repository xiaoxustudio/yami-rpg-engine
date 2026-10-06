import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import ForEach from '@app/components/commands/ForEach.vue';

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ syncState: vi.fn() }),
	getLocalStore: () => ({ syncState: vi.fn() })
}));

vi.mock('@app/components/custom-box-opts', () => ({
	customBoxOptions: {
		getters: null,
		parsers: null,
		fileDialog: null,
		browser: null,
		localize: null
	}
}));

vi.mock('@app/i18n', () => ({
	getYamiI18n: () => ({ global: { t: (key: string) => key } })
}));

const getDisplay = (id: string): string => {
	const el = document.getElementById(id);
	return el ? el.style.display : 'missing';
};

describe('ForEach window field visibility', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		document.body.innerHTML = '';
	});

	it('default data=list shows only list+variable, hides actor/element/saveIndex/touchId', async () => {
		const wrapper = mount(ForEach, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		await wrapper.vm.$nextTick();
		expect(getDisplay('forEach-list')).not.toBe('none');
		expect(getDisplay('forEach-variable')).not.toBe('none');
		expect(getDisplay('forEach-actor')).toBe('none');
		expect(getDisplay('forEach-element')).toBe('none');
		expect(getDisplay('forEach-saveIndex')).toBe('none');
		expect(getDisplay('forEach-touchId')).toBe('none');
		wrapper.unmount();
	});
});
