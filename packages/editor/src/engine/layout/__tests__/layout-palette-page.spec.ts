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
