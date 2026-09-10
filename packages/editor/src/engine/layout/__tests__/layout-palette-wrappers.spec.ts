import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { h, nextTick } from 'vue';
import { getLayoutStore } from '@app/stores/layout';
import LayoutPaletteHost from '../../../components/layout/LayoutPaletteHost.vue';
import PaletteNode from '../../../components/layout/PaletteNode.vue';

// LayoutPanel 接线件护栏（M5-b：整壳 Teleport 为唯一形态）：
// - LayoutPaletteHost 把 palette 支架搬进 body 隐藏容器，宿主处留空（供引擎挂 Vue 组树）；
// - PaletteNode 把单个整壳节点（.nav-item/.page-frame）交给 LayoutPalettePage 按归属搬家，
//   归属未发布时留在 palette 宿主（Teleport disabled），空 value 恒透传。

const createManager = (name: string): HTMLElement => {
	const el = document.createElement('div');
	el.className = 'page-manager group-manager';
	el.id = name;
	return el;
};

const flush = async (): Promise<void> => {
	await nextTick();
	await nextTick();
};

beforeEach(() => {
	document.body.innerHTML = '';
});

afterEach(() => {
	document.body.innerHTML = '';
	getLayoutStore().resetPageTargets();
	getLayoutStore().resetTabTargets();
});

describe('LayoutPaletteHost 整壳搬运', () => {
	it('palette 支架搬进 body 隐藏容器，宿主处留空；卸载后容器移除', async () => {
		const container = document.createElement('div');
		document.body.append(container);
		const wrapper = mount(LayoutPaletteHost, {
			attachTo: container,
			slots: { default: () => h('div', { id: 'palette-frame' }) }
		});
		await flush();
		try {
			const holder = document.body.querySelector(
				'.layout-palette-holder'
			) as HTMLElement | null;
			expect(holder).not.toBeNull();
			expect(holder?.style.display).toBe('none');
			expect(holder?.querySelector('#palette-frame')).not.toBeNull();
			expect(container.querySelector('#palette-frame')).toBeNull();
		} finally {
			wrapper.unmount();
			await nextTick();
		}
		expect(document.body.querySelector('.layout-palette-holder')).toBeNull();
	});
});

describe('PaletteNode 归属搬家', () => {
	it('归属未发布时留在 palette；发布后经 LayoutPalettePage 搬进 manager', async () => {
		const store = getLayoutStore();
		store.resetPageTargets();
		const manager = createManager('manager-a');
		document.body.append(manager);

		const container = document.createElement('div');
		document.body.append(container);

		const wrapper = mount(PaletteNode, {
			props: { value: 'scene', source: 'page' },
			attachTo: container,
			slots: { default: () => h('div', { class: 'page-frame', value: 'scene' }) }
		});
		await flush();
		const page = (): HTMLElement => document.querySelector('.page-frame') as HTMLElement;
		try {
			expect(page()).toBeTruthy();
			expect(page().parentNode).not.toBe(manager);

			store.setPageTargets({ scene: manager });
			await flush();
			expect(page().parentNode).toBe(manager);
		} finally {
			wrapper.unmount();
			store.resetPageTargets();
		}
	});

	it('空 value 恒走透传（不委托 LayoutPalettePage）', async () => {
		const container = document.createElement('div');
		document.body.append(container);
		const wrapper = mount(PaletteNode, {
			props: { value: '', source: 'page' },
			attachTo: container,
			slots: { default: () => h('div', { class: 'empty-page-frame', value: '' }) }
		});
		await flush();
		try {
			expect(container.querySelector('.empty-page-frame')).not.toBeNull();
		} finally {
			wrapper.unmount();
		}
	});
});
