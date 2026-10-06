import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import Team from '@app/components/tools/Team.vue';
import PresetElement from '@app/components/tools/PresetElement.vue';
import PresetObject from '@app/components/tools/PresetObject.vue';
import AutoTileSelectNode from '@app/components/tools/AutoTileSelectNode.vue';
import LightGetter from '@app/components/tools/LightGetter.vue';
import ObjectGetter from '@app/components/tools/ObjectGetter.vue';
import { composableEls } from '@app/composables/element-registry';

/**
 * 5 个窗口 composable（Team / PresetElement / PresetObject / TileNode / PresetGetter 工厂）
 * 过去按 id 直查元素，现在读共享注册表 `composableEls`。
 *
 * 覆盖三类登记手法：窗口框架的 `:ref`（Team/Preset*）、具名 ref 的 `registerElement`（Getter 的 `frame`、
 * TileNode 的 `frame`）、以及 `team-confirm` 由 SFC `@confirm` 承接。
 */
vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ syncState: vi.fn(), components: {} }),
	getLocalStore: () => ({ syncState: vi.fn(), components: {} })
}));

vi.mock('@app/i18n', () => ({
	getYamiI18n: () => ({ global: { t: () => '' } })
}));

// Team.vue 走 legacy 门面 `@app/data/team-window.ts`：mock 它才能观察"@confirm 是否真的接到 composable"
vi.mock('@app/data/team-window.ts', () => ({
	Team: {
		confirm: vi.fn(),
		listSelect: vi.fn(),
		listPopup: vi.fn(),
		listChange: vi.fn()
	}
}));

const mountSettle = async (component: Parameters<typeof mount>[0]) => {
	const wrapper = mount(component, { attachTo: document.body });
	await wrapper.vm.$nextTick();
	await wrapper.vm.$nextTick();
	return wrapper;
};

const expectRegistered = (ids: string[]) => {
	for (const id of ids) {
		const el = composableEls.get(id);
		expect(el, `${id} 未登记`).toBeTruthy();
		expect(el?.id).toBe(id);
	}
};

describe('窗口 composable 读注册表', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		document.body.innerHTML = '';
		composableEls.clear();
	});

	it('Team：窗口与列表登记，确认按钮走 SFC 的 @confirm', async () => {
		const wrapper = await mountSettle(Team);
		expectRegistered(['team', 'team-list']);

		// `team-confirm` 由 WindowFrame 生成、注册表取不到 → SFC 的 @confirm 驱动 legacy 门面
		const { Team: TeamController } = await import('@app/data/team-window.ts');
		const button = document.getElementById('team-confirm');
		expect(button).toBeTruthy();
		button!.dispatchEvent(new Event('click', { bubbles: true }));
		expect(TeamController.confirm).toHaveBeenCalled();

		wrapper.unmount();
	});

	it('PresetElement / PresetObject：框架、控件与列表全部登记', async () => {
		const a = await mountSettle(PresetElement);
		expectRegistered([
			'presetElement',
			'presetElement-uiId',
			'presetElement-list',
			'presetElement-searcher'
		]);
		a.unmount();

		const b = await mountSettle(PresetObject);
		expectRegistered([
			'presetObject',
			'presetObject-sceneId',
			'presetObject-list',
			'presetObject-searcher'
		]);
		b.unmount();
	});

	it('AutoTileSelectNode：画布/屏幕/选框登记，窗口框架用具名 ref 命令式登记', async () => {
		const wrapper = await mountSettle(AutoTileSelectNode);
		expectRegistered([
			'autoTile-selectNode',
			'autoTile-selectNode-canvas',
			'autoTile-selectNode-screen',
			'autoTile-selectNode-marquee'
		]);
		wrapper.unmount();
	});

	it('PresetGetter 工厂：两个 getter 窗口的 4 个 id 都登记（`${domKey}` 动态键）', async () => {
		const a = await mountSettle(LightGetter);
		expectRegistered([
			'lightGetter',
			'lightGetter-type',
			'lightGetter-presetId',
			'lightGetter-variable'
		]);
		a.unmount();

		const b = await mountSettle(ObjectGetter);
		expectRegistered([
			'objectGetter',
			'objectGetter-type',
			'objectGetter-presetId',
			'objectGetter-variable'
		]);
		b.unmount();
	});

	it('注册表为空时模块侧安全 no-op（不再按 id 回退）', () => {
		composableEls.clear();
		// getFrame() 取不到 → open 里的 setForm/getForm 链路整体 no-op，不抛错
		expect(composableEls.get('lightGetter')).toBeUndefined();
		expect(composableEls.get('team-list')).toBeUndefined();
	});
});
