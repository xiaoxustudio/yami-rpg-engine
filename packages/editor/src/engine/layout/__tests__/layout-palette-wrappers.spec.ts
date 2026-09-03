import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h, nextTick } from 'vue';
import { setLayoutVueRenderMode } from '@app/engine/layout/layout.ts';
import { getLayoutStore } from '@app/stores/layout';
import LayoutPaletteHost from '../../../components/layout/LayoutPaletteHost.vue';
import PaletteNode from '../../../components/layout/PaletteNode.vue';

// LayoutPanel 接线件护栏（M3b-2b，docs/layout-vue-plan.md 附录 F）：
// - 默认关（mode 0）：PaletteNode/LayoutPaletteHost 必须「透传等价」——不产生额外 DOM
//   元素/不挪位，保证 NavBar/YMPageManager 的 childNodes 结构与 Layout.initialize 扫描不变；
// - teleport 模式（mode 2）：PaletteNode 委托 LayoutPalettePage 按归属搬家，
//   LayoutPaletteHost 把整个 palette 支架搬进 body 隐藏容器、宿主处留空。

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
	setLayoutVueRenderMode(0);
	document.body.innerHTML = '';
});

afterEach(() => {
	setLayoutVueRenderMode(0);
	document.body.innerHTML = '';
	getLayoutStore().resetPageTargets();
	getLayoutStore().resetTabTargets();
});

describe('PaletteNode 默认透传（mode 0）', () => {
	it('单节点：渲染为 slot 内容本身，无额外包裹元素', async () => {
		const container = document.createElement('div');
		document.body.append(container);
		const wrapper = mount(PaletteNode, {
			props: { value: 'scene', source: 'page' },
			attachTo: container,
			slots: { default: () => h('div', { class: 'nav-item', value: 'scene' }) }
		});
		await nextTick();
		try {
			const items = Array.from(container.querySelectorAll('.nav-item'));
			expect(items).toHaveLength(1);
			expect(items[0].className).toBe('nav-item');
			expect(items[0].getAttribute('value')).toBe('scene');
		} finally {
			wrapper.unmount();
		}
	});

	it('多节点成组：子元素顺序与数量不变（无额外元素）', async () => {
		const container = document.createElement('div');
		document.body.append(container);
		const Group = defineComponent({
			setup() {
				return () =>
					h('div', { class: 'nav-bar' }, [
						h(
							PaletteNode,
							{ value: 'project', source: 'tab' },
							{
								default: () => h('div', { class: 'nav-item', value: 'project' })
							}
						),
						h(
							PaletteNode,
							{ value: 'scene', source: 'tab' },
							{
								default: () => h('div', { class: 'nav-item', value: 'scene' })
							}
						)
					]);
			}
		});
		const wrapper = mount(Group, { attachTo: container });
		await nextTick();
		try {
			const nav = container.querySelector('.nav-bar') as HTMLElement;
			const children = Array.from(nav.children);
			expect(children.map((el) => el.getAttribute('value'))).toEqual(['project', 'scene']);
		} finally {
			wrapper.unmount();
		}
	});
});

describe('LayoutPaletteHost 默认透传（mode 0）', () => {
	it('slot 内容原样内联，body 不产生隐藏容器', async () => {
		const container = document.createElement('div');
		document.body.append(container);
		const wrapper = mount(LayoutPaletteHost, {
			attachTo: container,
			slots: { default: () => h('div', { id: 'inline-palette' }) }
		});
		await nextTick();
		try {
			expect(container.querySelector('#inline-palette')).not.toBeNull();
			expect(document.body.querySelector('.layout-palette-holder')).toBeNull();
		} finally {
			wrapper.unmount();
		}
	});
});

describe('LayoutPaletteHost teleport 模式（mode 2）', () => {
	it('palette 支架搬进 body 隐藏容器，宿主处留空；卸载后容器移除', async () => {
		const container = document.createElement('div');
		document.body.append(container);
		setLayoutVueRenderMode(2);
		const wrapper = mount(LayoutPaletteHost, {
			attachTo: container,
			slots: { default: () => h('div', { id: 'teleport-palette' }) }
		});
		await flush();
		try {
			const holder = document.body.querySelector(
				'.layout-palette-holder'
			) as HTMLElement | null;
			expect(holder).not.toBeNull();
			expect(holder?.style.display).toBe('none');
			expect(holder?.querySelector('#teleport-palette')).not.toBeNull();
			expect(container.querySelector('#teleport-palette')).toBeNull();
		} finally {
			wrapper.unmount();
			await nextTick();
			setLayoutVueRenderMode(0);
		}
		expect(document.body.querySelector('.layout-palette-holder')).toBeNull();
	});
});

describe('PaletteNode teleport 模式（mode 2）归属搬家', () => {
	it('归属发布后经 LayoutPalettePage 搬进 manager；空 value 仍透传', async () => {
		const store = getLayoutStore();
		store.resetPageTargets();
		const manager = createManager('manager-a');
		document.body.append(manager);

		const container = document.createElement('div');
		document.body.append(container);
		setLayoutVueRenderMode(2);

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
			setLayoutVueRenderMode(0);
			store.resetPageTargets();
		}
	});

	it('空 value 在 teleport 模式仍走透传（不委托 LayoutPalettePage）', async () => {
		const container = document.createElement('div');
		document.body.append(container);
		setLayoutVueRenderMode(2);
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
			setLayoutVueRenderMode(0);
		}
	});
});
