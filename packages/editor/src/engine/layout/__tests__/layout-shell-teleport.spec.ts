import { beforeEach, describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h, nextTick, onMounted, type PropType } from 'vue';
import { YMNavBar, YMPageManager } from '@ui-kit';
import { getLayoutStore } from '@app/stores/layout';
import { collectPageTargets } from '../layout-page-targets';
import LayoutPalettePage from '../../../components/layout/LayoutPalettePage.vue';

// M3b-2b 接线前决策探针（layout 迁移规划 附录 F）：
// 验证「整壳 .page-frame Teleport」与「引擎后置 nav 排序 pass」两种机制在 jsdom 成立，
// 为 LayoutPanel 12 页接入与 clear 语义终版定稿提供依据。

const store = getLayoutStore();

// 该文件内所有用例共享的“内容组件挂载计数”（Teleport 只搬家不重建的判据）
const probeMounts = { value: 0 };

const ProbeCounter = defineComponent({
	setup(_props, { slots }) {
		onMounted(() => {
			probeMounts.value += 1;
		});
		return () => slots.default?.() ?? null;
	}
});

const mountCount = (): number => probeMounts.value;

/** 模拟 LayoutPanel palette：每 value 一个 LayoutPalettePage，slot 内容为整壳节点（nav-item 或 page-frame）。 */
const PaletteShells = defineComponent({
	props: {
		values: { type: Array as PropType<string[]>, required: true },
		kind: { type: String as PropType<'frame' | 'item'>, required: true }
	},
	setup(props) {
		return () =>
			h(
				'div',
				{ class: 'palette-host' },
				props.values.map((value) =>
					h(
						LayoutPalettePage,
						{ value },
						{
							default: () =>
								h(ProbeCounter, null, {
									default: () =>
										props.kind === 'frame'
											? h(
													'div',
													{
														class: 'page-frame',
														value,
														id: `frame-${value}`
													},
													[
														h(
															'span',
															{ class: 'probe-frame' },
															`page-${value}`
														)
													]
												)
											: h('div', { class: 'nav-item', value }, [
													h('span', { class: 'probe-nav' }, value)
												])
								})
						}
					)
				)
			);
	}
});

type ManagerHost = HTMLElement & {
	switch(value: string | null): void;
	index: string | null;
	active: HTMLElement | null;
};

const mountManager = async (id: string): Promise<ManagerHost> => {
	const host = document.createElement('div');
	document.body.append(host);
	const wrapper = mount(YMPageManager, { props: { id }, attachTo: host });
	await nextTick();
	return wrapper.element as ManagerHost;
};

const mountNav = async () => {
	const host = document.createElement('div');
	document.body.append(host);
	const wrapper = mount(YMNavBar, { attachTo: host });
	await nextTick();
	return wrapper.element as HTMLElement;
};

const frameOf = (value: string): HTMLElement => document.getElementById(`frame-${value}`)!;
const navItemsOf = (nav: HTMLElement): string[] =>
	Array.from(nav.children)
		.filter((child) => child.classList.contains('nav-item'))
		.map((child) => child.getAttribute('value')!);

/** 引擎式排序 pass：按 tabs 顺序 appendChild 到目标（末尾追加即保证顺序，且对 Vue Teleport 内容安全）。 */
const reorderPass = (target: HTMLElement, tabs: string[]): void => {
	for (const tab of tabs) {
		const item = Array.from(target.children).find(
			(child) => child instanceof HTMLElement && child.getAttribute('value') === tab
		) as HTMLElement | undefined;
		if (item) target.appendChild(item);
	}
};

beforeEach(() => {
	probeMounts.value = 0;
	store.resetPageTargets();
	document.body.innerHTML = '';
});

describe('M3b-2b 探针 A：整壳 .page-frame Teleport 进 group-manager', () => {
	it('整壳帧进入 manager 后可由 manager.switch 驱动；换归属只搬家不重建；DOM walk 仍可发现归属', async () => {
		const managerA = await mountManager('manager-a');
		const managerB = await mountManager('manager-b');
		// 模拟组结构：group expando.manager 指向 Vue manager root（collectPageTargets 的输入形态）
		const groupA = document.createElement('div');
		groupA.className = 'group';
		(groupA as HTMLElement & { manager?: HTMLElement }).manager = managerA;
		const groupB = document.createElement('div');
		groupB.className = 'group';
		(groupB as HTMLElement & { manager?: HTMLElement }).manager = managerB;
		const root = document.createElement('div');
		root.append(groupA, groupB);
		document.body.append(root);

		const paletteHost = document.createElement('div');
		document.body.append(paletteHost);
		const palette = mount(PaletteShells, {
			props: { values: ['project', 'scene'], kind: 'frame' },
			attachTo: paletteHost
		});
		const frame = (): HTMLElement => frameOf('scene');

		try {
			// 无归属：帧留在 palette 宿主
			expect(
				(frame().parentNode as HTMLElement | null)?.classList.contains('palette-host')
			).toBe(true);

			store.setPageTargets({ scene: managerA });
			await nextTick();
			expect(frame().parentNode).toBe(managerA);
			expect(collectPageTargets(root)).toEqual({ scene: managerA });
			expect(mountCount()).toBe(2); // project + scene 帧各一次

			// manager.switch 语义：以整壳帧为子节点正常工作
			managerA.switch('scene');
			expect(frame().classList.contains('visible')).toBe(true);
			expect(managerA.index).toBe('scene');
			expect(managerA.active).toBe(frame());

			// 换归属：同一节点搬去 managerB，不重建
			store.setPageTargets({ scene: managerB });
			await nextTick();
			expect(frame()).toBe(frameOf('scene'));
			expect(frame().parentNode).toBe(managerB);
			expect(Array.from(managerA.children)).not.toContain(frame());
			expect(mountCount()).toBe(2);
			expect(collectPageTargets(root)).toEqual({ scene: managerB });
		} finally {
			palette.unmount();
		}
	});

	it('manager.switch 的可见性在 Teleport 搬家后仍可收敛（离开前 saveNavStates 清 visible 语义）', async () => {
		const managerA = await mountManager('manager-a');
		const managerB = await mountManager('manager-b');
		const paletteHost = document.createElement('div');
		document.body.append(paletteHost);
		const palette = mount(PaletteShells, {
			props: { values: ['project', 'scene'], kind: 'frame' },
			attachTo: paletteHost
		});

		try {
			store.setPageTargets({ project: managerA, scene: managerA });
			await nextTick();
			managerA.switch('project');
			expect(managerA.active).toBe(frameOf('project'));
			expect(frameOf('project').classList.contains('visible')).toBe(true);

			// 离开工作区前引擎经 saveNavStates → write(nav,null) → switch(null) 清掉 visible，
			// 帧再整壳搬到 B；B 内首激活只应剩唯一 visible
			managerA.switch(null);
			expect(frameOf('project').classList.contains('visible')).toBe(false);
			expect(frameOf('scene').classList.contains('visible')).toBe(false);

			store.setPageTargets({ project: managerB, scene: managerB });
			await nextTick();
			expect(Array.from(managerB.children)).toEqual([frameOf('project'), frameOf('scene')]);
			managerB.switch('scene');
			expect(managerB.index).toBe('scene');
			expect(frameOf('scene').classList.contains('visible')).toBe(true);
			expect(frameOf('project').classList.contains('visible')).toBe(false);
			expect(mountCount()).toBe(2);
		} finally {
			palette.unmount();
		}
	});
});

describe('M3b-2b 探针 B：nav 内容 Teleport + 引擎后置排序 pass', () => {
	it('多 nav-item Teleport 进同一 leaf nav 后，引擎排序 pass 可随时收敛到 tabs 顺序', async () => {
		const nav = await mountNav();
		const paletteHost = document.createElement('div');
		document.body.append(paletteHost);
		const palette = mount(PaletteShells, {
			props: { values: ['project', 'scene', 'inspector'], kind: 'item' },
			attachTo: paletteHost
		});

		try {
			// palette 声明序 project → scene：Teleport 后也是该序（与 leaf tabs 序可不同）
			store.setPageTargets({ project: nav, scene: nav });
			await nextTick();
			expect(navItemsOf(nav)).toEqual(['project', 'scene']);

			// 引擎 pass：收敛到 tabs 序 [scene, project]
			reorderPass(nav, ['scene', 'project']);
			expect(navItemsOf(nav)).toEqual(['scene', 'project']);

			// 第三方加入（如拖入/工作区变更）→ append 在尾；再 pass 一次即可收敛
			store.setPageTargets({ project: nav, scene: nav, inspector: nav });
			await nextTick();
			expect(navItemsOf(nav)).toEqual(['scene', 'project', 'inspector']);
			reorderPass(nav, ['inspector', 'scene', 'project']);
			expect(navItemsOf(nav)).toEqual(['inspector', 'scene', 'project']);

			// 移出后其余顺序不受影响，pass 幂等
			store.setPageTargets({ scene: nav, inspector: nav });
			await nextTick();
			expect(navItemsOf(nav)).toEqual(['inspector', 'scene']);
			reorderPass(nav, ['scene', 'inspector']);
			expect(navItemsOf(nav)).toEqual(['scene', 'inspector']);
			expect(mountCount()).toBe(3); // 三个 nav-item 全程无重建
		} finally {
			palette.unmount();
		}
	});

	it('排序 pass 后 nav.write 仍能选中对应页签（nav-bar 功能不受 Teleport 影响）', async () => {
		const nav = await mountNav();
		const paletteHost = document.createElement('div');
		document.body.append(paletteHost);
		const palette = mount(PaletteShells, {
			props: { values: ['project', 'scene'], kind: 'item' },
			attachTo: paletteHost
		});

		try {
			store.setPageTargets({ project: nav, scene: nav });
			await nextTick();
			reorderPass(nav, ['scene', 'project']);
			expect(navItemsOf(nav)).toEqual(['scene', 'project']);

			(nav as HTMLElement & { write(v: unknown): void }).write('scene');
			expect(nav.querySelector('.nav-item.selected')?.getAttribute('value')).toBe('scene');
			(nav as HTMLElement & { write(v: unknown): void }).write('project');
			expect(nav.querySelector('.nav-item.selected')?.getAttribute('value')).toBe('project');
		} finally {
			palette.unmount();
		}
	});
});
