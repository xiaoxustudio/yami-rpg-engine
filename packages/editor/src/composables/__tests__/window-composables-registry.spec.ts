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
import { getTileNodeHandles } from '@app/composables/auto-tile-handles';

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ syncState: vi.fn(), components: {} }),
	getLocalStore: () => ({ syncState: vi.fn(), components: {} })
}));

vi.mock('@app/i18n', () => ({
	getYamiI18n: () => ({ global: { t: () => '' } })
}));

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

	it('AutoTileSelectNode：三个节点经句柄表交出，不再进注册表', async () => {
		const wrapper = await mountSettle(AutoTileSelectNode);
		const handles = getTileNodeHandles();
		expect(handles).toBeTruthy();
		expect(handles?.canvas.id).toBe('autoTile-selectNode-canvas');
		expect(handles?.screen.id).toBe('autoTile-selectNode-screen');
		expect(handles?.marquee.id).toBe('autoTile-selectNode-marquee');
		for (const id of [
			'autoTile-selectNode-canvas',
			'autoTile-selectNode-screen',
			'autoTile-selectNode-marquee'
		]) {
			expect(composableEls.get(id), id + ' 不该再进注册表').toBeUndefined();
		}
		wrapper.unmount();
		expect(getTileNodeHandles(), '卸载后应注销').toBeNull();
	});

	it('PresetGetter 工厂：窗口只登记根元素，控件由模板 ref 交给 composable', async () => {
		const a = await mountSettle(LightGetter);
		// 元素契约迁移后控件不再进注册表：窗口根元素仍登记（窗口激活 / 关闭钩子要用），
		// 三个控件由 initialize(fields) 交接给 composable。
		expectRegistered(['lightGetter']);
		expect(composableEls.get('lightGetter-type')).toBeUndefined();
		expect(composableEls.get('lightGetter-presetId')).toBeUndefined();
		expect(composableEls.get('lightGetter-variable')).toBeUndefined();
		a.unmount();

		const b = await mountSettle(ObjectGetter);
		expectRegistered(['objectGetter']);
		expect(composableEls.get('objectGetter-type')).toBeUndefined();
		expect(composableEls.get('objectGetter-presetId')).toBeUndefined();
		expect(composableEls.get('objectGetter-variable')).toBeUndefined();
		b.unmount();
	});

	it('注册表为空时模块侧安全 no-op（不再按 id 回退）', () => {
		composableEls.clear();
		expect(composableEls.get('lightGetter')).toBeUndefined();
		expect(composableEls.get('team-list')).toBeUndefined();
	});
});
