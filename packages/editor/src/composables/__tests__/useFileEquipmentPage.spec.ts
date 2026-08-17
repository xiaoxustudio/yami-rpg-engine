import { beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent } from 'vue';
import { mount } from '@vue/test-utils';
import { useFileEquipmentPage } from '@app/composables/useFileEquipmentPage';

interface EntityData {
	icon: string;
	clip: number[];
	inherit: string;
}

const fileEquipment = vi.hoisted(() => ({
	target: null as EntityData | null,
	update: vi.fn()
}));

vi.mock('@app/legacy/inspector/inspector.ts', () => ({
	Inspector: {
		fileEquipment,
		getKey: (el: HTMLElement) => el.id.slice(el.id.indexOf('-') + 1)
	}
}));

const Host = defineComponent({
	setup() {
		return useFileEquipmentPage();
	},
	render: () => null
});

const makeEquipment = (overrides: Partial<EntityData> = {}): EntityData => ({
	icon: 'icon-1',
	clip: [0, 0, 32, 32],
	inherit: '',
	...overrides
});

describe('useFileEquipmentPage（fileEquipment inspector 页面 composable）', () => {
	beforeEach(() => {
		document.body.innerHTML = '';
		fileEquipment.target = null;
		fileEquipment.update.mockClear();
	});

	const mountPage = () => {
		const wrapper = mount(Host);
		return {
			wrapper,
			page: wrapper.vm as unknown as ReturnType<typeof useFileEquipmentPage>
		};
	};

	it('sync 从 Inspector.fileEquipment.target 填充 form', () => {
		const { wrapper, page } = mountPage();
		fileEquipment.target = makeEquipment();
		page.sync();
		expect(page.form.icon).toBe('icon-1');
		expect(page.form.clip).toEqual([0, 0, 32, 32]);
		expect(page.form.inherit).toBe('');
		wrapper.unmount();
	});

	it('target 为 null 时 sync 不覆盖 form', () => {
		const { wrapper, page } = mountPage();
		fileEquipment.target = makeEquipment();
		page.sync();
		fileEquipment.target = null;
		page.sync();
		expect(page.form.icon).toBe('icon-1');
		expect(page.form.clip).toEqual([0, 0, 32, 32]);
		wrapper.unmount();
	});

	it('onParamInput 找不到 fileEquipment 控件时跳过 update', () => {
		const { wrapper, page } = mountPage();
		fileEquipment.target = makeEquipment();
		const el = document.createElement('input');
		document.body.appendChild(el);
		el.addEventListener('input', (e) => page.onParamInput(e));
		el.dispatchEvent(new Event('input', { bubbles: true }));
		expect(fileEquipment.update).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('onParamInput 从嵌套元素向上解析控件并调用 update + 重新 sync', () => {
		const { wrapper, page } = mountPage();
		fileEquipment.update.mockImplementation(
			(equipment: EntityData, key: string, value: unknown) => {
				(equipment as unknown as Record<string, unknown>)[key] = value;
			}
		);
		fileEquipment.target = makeEquipment();
		const el = document.createElement('div') as HTMLElement & { read: () => string };
		el.id = 'fileEquipment-inherit';
		el.read = () => 'equipment-2';
		const input = document.createElement('input');
		el.appendChild(input);
		document.body.appendChild(el);
		el.addEventListener('input', (e) => page.onParamInput(e));
		input.dispatchEvent(new Event('input', { bubbles: true }));
		expect(fileEquipment.update).toHaveBeenCalledWith(
			fileEquipment.target,
			'inherit',
			'equipment-2'
		);
		expect(page.form.inherit).toBe('equipment-2');
		wrapper.unmount();
	});

	it('onParamInput 直接落在控件元素上', () => {
		const { wrapper, page } = mountPage();
		fileEquipment.target = makeEquipment();
		const el = document.createElement('div') as HTMLElement & { read: () => string };
		el.id = 'fileEquipment-icon';
		el.read = () => 'icon-2';
		document.body.appendChild(el);
		el.addEventListener('input', (e) => page.onParamInput(e));
		el.dispatchEvent(new Event('input', { bubbles: true }));
		expect(fileEquipment.update).toHaveBeenCalledWith(fileEquipment.target, 'icon', 'icon-2');
		wrapper.unmount();
	});
});
