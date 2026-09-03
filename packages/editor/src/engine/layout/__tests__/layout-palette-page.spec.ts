import { beforeEach, describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h, nextTick, onMounted } from 'vue';
import { getLayoutStore } from '@app/stores/layout';
import LayoutPalettePage from '../../../components/layout/LayoutPalettePage.vue';
import {
	buildLayoutFixture,
	DIRECTORY_SCHEME,
	mountScheme,
	registerLayout,
	switchWorkspace
} from './layout-spec-utils';

// LayoutPalettePage（M3b 接线首件）：页面内容经 Teleport 挂到 store.pageTargets[value]。
// 覆盖：无归属 disabled 留在宿主 → 归属更新搬进 group-manager → 换归属搬家不重建 → 清归属回宿主。

const createManager = (name: string): HTMLElement => {
	const el = document.createElement('div');
	el.className = 'page-manager group-manager';
	el.id = name;
	return el;
};

describe('LayoutPalettePage 纯 store 驱动', () => {
	const store = getLayoutStore();

	beforeEach(() => {
		store.resetPageTargets();
		document.body.innerHTML = '';
	});

	it('无归属 disabled 留宿主；归属更新后搬进 manager；搬家/清归属均不重建', async () => {
		let mounts = 0;
		const Marker = defineComponent({
			setup() {
				onMounted(() => {
					mounts += 1;
				});
				return () => h('span', { class: 'palette-marker' }, 'page');
			}
		});
		const managerA = createManager('manager-a');
		const managerB = createManager('manager-b');
		document.body.append(managerA, managerB);
		const host = document.createElement('div');
		document.body.append(host);

		const wrapper = mount(LayoutPalettePage, {
			props: { value: 'scene' },
			attachTo: host,
			slots: { default: () => h(Marker) }
		});
		const content = (): HTMLElement => document.querySelector('.palette-marker') as HTMLElement;

		try {
			expect(mounts).toBe(1);
			expect(host.contains(content())).toBe(true);

			store.setPageTargets({ scene: managerA });
			await nextTick();
			expect(content().parentNode).toBe(managerA);
			expect(mounts).toBe(1);

			store.setPageTargets({ scene: managerB });
			await nextTick();
			expect(content().parentNode).toBe(managerB);
			expect(mounts).toBe(1);

			store.setPageTargets({});
			await nextTick();
			expect(content().isConnected).toBe(true);
			expect(host.contains(content())).toBe(true);
			expect(content().parentNode).not.toBe(managerA);
			expect(content().parentNode).not.toBe(managerB);
			expect(mounts).toBe(1);
		} finally {
			wrapper.unmount();
		}
	});
});

describe('LayoutPalettePage 与 layout 收敛点联动', () => {
	const store = getLayoutStore();

	beforeEach(() => {
		store.resetPageTargets();
		document.body.innerHTML = '';
	});

	it('随 loadLayoutScheme 的 pageTargets 同步搬家；跨工作区往返目标一致且不重建', async () => {
		let mounts = 0;
		const Marker = defineComponent({
			setup() {
				onMounted(() => {
					mounts += 1;
				});
				return () => h('span', { class: 'palette-marker' }, 'page');
			}
		});

		const fixture = buildLayoutFixture();
		const host = document.createElement('div');
		document.body.append(host);
		const wrapper = mount(LayoutPalettePage, {
			props: { value: 'scene' },
			attachTo: host,
			slots: { default: () => h(Marker) }
		});
		const content = (): HTMLElement => document.querySelector('.palette-marker') as HTMLElement;

		try {
			registerLayout(fixture);
			switchWorkspace(fixture, 'directory');
			expect(host.contains(content())).toBe(true);
			mountScheme('directory', DIRECTORY_SCHEME);
			await nextTick();

			const directorySceneManager = store.pageTargets.scene;
			expect(content().parentNode).toBe(directorySceneManager);
			expect(directorySceneManager).toBe(fixture.items.scene.page.parentNode);
			expect(mounts).toBe(1);

			switchWorkspace(fixture, 'scene');
			mountScheme('scene', {
				end: 1,
				split: 'horizontal',
				children: [
					{ end: 0.5, tabs: ['scene', 'project'] },
					{ end: 1, tabs: ['inspector'] }
				]
			});
			await nextTick();
			const sceneManager = store.pageTargets.scene;
			expect(content().parentNode).toBe(sceneManager);
			expect(sceneManager).not.toBe(directorySceneManager);
			expect(mounts).toBe(1);

			switchWorkspace(fixture, 'directory');
			mountScheme('directory', DIRECTORY_SCHEME);
			await nextTick();
			expect(content().parentNode).toBe(directorySceneManager);
			expect(mounts).toBe(1);
		} finally {
			wrapper.unmount();
		}
	});
});

describe('LayoutPalettePage source="tab"（tabTargets 页签归属）', () => {
	const store = getLayoutStore();

	const createNav = (name: string): HTMLElement => {
		const el = document.createElement('div');
		el.className = 'nav-bar';
		el.id = name;
		return el;
	};

	beforeEach(() => {
		store.resetTabTargets();
		document.body.innerHTML = '';
	});

	it('无归属 disabled 留宿主；tabTargets 归属后搬进 nav；换归属不重建；清归属回宿主', async () => {
		let mounts = 0;
		const Marker = defineComponent({
			setup() {
				onMounted(() => {
					mounts += 1;
				});
				return () => h('span', { class: 'tab-marker' }, 'tab');
			}
		});
		const navA = createNav('nav-a');
		const navB = createNav('nav-b');
		document.body.append(navA, navB);
		const host = document.createElement('div');
		document.body.append(host);

		const wrapper = mount(LayoutPalettePage, {
			props: { value: 'scene', source: 'tab' },
			attachTo: host,
			slots: { default: () => h(Marker) }
		});
		const content = (): HTMLElement => document.querySelector('.tab-marker') as HTMLElement;

		try {
			expect(mounts).toBe(1);
			expect(host.contains(content())).toBe(true);

			store.setTabTargets({ scene: navA });
			await nextTick();
			expect(content().parentNode).toBe(navA);
			expect(mounts).toBe(1);

			store.setTabTargets({ scene: navB });
			await nextTick();
			expect(content().parentNode).toBe(navB);
			expect(mounts).toBe(1);

			store.setTabTargets({});
			await nextTick();
			expect(content().isConnected).toBe(true);
			expect(host.contains(content())).toBe(true);
			expect(content().parentNode).not.toBe(navA);
			expect(content().parentNode).not.toBe(navB);
			expect(mounts).toBe(1);
		} finally {
			wrapper.unmount();
		}
	});

	it('source 缺省仍走 pageTargets；与 tab 归属互不干扰', async () => {
		let pageMounts = 0;
		let tabMounts = 0;
		const PageMarker = defineComponent({
			setup() {
				onMounted(() => {
					pageMounts += 1;
				});
				return () => h('span', { class: 'page-marker' }, 'page');
			}
		});
		const TabMarker = defineComponent({
			setup() {
				onMounted(() => {
					tabMounts += 1;
				});
				return () => h('span', { class: 'tab-marker' }, 'tab');
			}
		});
		const manager = document.createElement('div');
		manager.className = 'page-manager';
		const nav = createNav('nav');
		document.body.append(manager, nav);
		const host = document.createElement('div');
		document.body.append(host);

		const pageWrapper = mount(LayoutPalettePage, {
			props: { value: 'scene' },
			attachTo: host,
			slots: { default: () => h(PageMarker) }
		});
		const tabWrapper = mount(LayoutPalettePage, {
			props: { value: 'scene', source: 'tab' },
			attachTo: host,
			slots: { default: () => h(TabMarker) }
		});
		const pageContent = (): HTMLElement =>
			document.querySelector('.page-marker') as HTMLElement;
		const tabContent = (): HTMLElement => document.querySelector('.tab-marker') as HTMLElement;

		try {
			// 只设 page 归属：page 搬走、tab 留宿主
			store.setPageTargets({ scene: manager as HTMLElement });
			await nextTick();
			expect(pageContent().parentNode).toBe(manager);
			expect(host.contains(tabContent())).toBe(true);

			// 只设 tab 归属：tab 搬走、page 不动
			store.setTabTargets({ scene: nav });
			await nextTick();
			expect(tabContent().parentNode).toBe(nav);
			expect(pageContent().parentNode).toBe(manager);
			expect(pageMounts).toBe(1);
			expect(tabMounts).toBe(1);
		} finally {
			pageWrapper.unmount();
			tabWrapper.unmount();
		}
	});
});
