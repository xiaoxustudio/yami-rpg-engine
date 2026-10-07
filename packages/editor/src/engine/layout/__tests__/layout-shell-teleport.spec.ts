import { beforeEach, describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h, nextTick, onMounted, type PropType } from 'vue';
import { YMNavBar, YMPageManager } from '@ui-kit';
import { getLayoutStore } from '@app/stores/layout';
import { collectPageTargets } from '../layout-page-targets';
import LayoutPalettePage from '../../../components/layout/LayoutPalettePage.vue';

const store = getLayoutStore();

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
			expect(
				(frame().parentNode as HTMLElement | null)?.classList.contains('palette-host')
			).toBe(true);

			store.setPageTargets({ scene: managerA });
			await nextTick();
			expect(frame().parentNode).toBe(managerA);
			expect(collectPageTargets(root)).toEqual({ scene: managerA });
			expect(mountCount()).toBe(2);

			managerA.switch('scene');
			expect(frame().classList.contains('visible')).toBe(true);
			expect(managerA.index).toBe('scene');
			expect(managerA.active).toBe(frame());

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
			store.setPageTargets({ project: nav, scene: nav });
			await nextTick();
			expect(navItemsOf(nav)).toEqual(['project', 'scene']);

			reorderPass(nav, ['scene', 'project']);
			expect(navItemsOf(nav)).toEqual(['scene', 'project']);

			store.setPageTargets({ project: nav, scene: nav, inspector: nav });
			await nextTick();
			expect(navItemsOf(nav)).toEqual(['scene', 'project', 'inspector']);
			reorderPass(nav, ['inspector', 'scene', 'project']);
			expect(navItemsOf(nav)).toEqual(['inspector', 'scene', 'project']);

			store.setPageTargets({ scene: nav, inspector: nav });
			await nextTick();
			expect(navItemsOf(nav)).toEqual(['inspector', 'scene']);
			reorderPass(nav, ['scene', 'inspector']);
			expect(navItemsOf(nav)).toEqual(['scene', 'inspector']);
			expect(mountCount()).toBe(3);
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
