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
import { getTeamHandles } from '@app/composables/team-handles';
import { presetElementNodes, presetObjectNodes } from '@app/composables/window-nodes';

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

const expectNotRegistered = (ids: string[]) => {
	for (const id of ids) {
		expect(composableEls.get(id), `${id} 不该再进注册表`).toBeFalsy();
		expect(document.getElementById(id), `${id} 模板里应存在`).toBeTruthy();
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
		// 迁移后控件不再进注册表：窗口交出 { root, list } 句柄表
		const handles = getTeamHandles();
		expect(handles?.root.id).toBe('team');
		expect(handles?.list.id).toBe('team-list');
		expect(composableEls.get('team-list')).toBeUndefined();

		const { Team: TeamController } = await import('@app/data/team-window.ts');
		const button = document.getElementById('team-confirm');
		expect(button).toBeTruthy();
		button!.dispatchEvent(new Event('click', { bubbles: true }));
		expect(TeamController.confirm).toHaveBeenCalled();

		wrapper.unmount();
	});

	it('PresetElement / PresetObject：框架、控件与列表改由窗口节点表交出', async () => {
		const a = await mountSettle(PresetElement);
		expectNotRegistered([
			'presetElement',
			'presetElement-uiId',
			'presetElement-list',
			'presetElement-searcher'
		]);
		for (const key of ['frame', 'ui', 'list', 'searcher'] as const) {
			expect(presetElementNodes.get(key), `presetElementNodes.${key} 应交出`).toBeTruthy();
		}
		a.unmount();

		const b = await mountSettle(PresetObject);
		expectNotRegistered([
			'presetObject',
			'presetObject-sceneId',
			'presetObject-list',
			'presetObject-searcher'
		]);
		for (const key of ['frame', 'scene', 'list', 'searcher'] as const) {
			expect(presetObjectNodes.get(key), `presetObjectNodes.${key} 应交出`).toBeTruthy();
		}
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

	it('PresetGetter 工厂：窗口与控件都不进注册表，都由模板 ref 交给 composable', async () => {
		const a = await mountSettle(LightGetter);
		// 迁移后窗口根也不再登记：窗口激活 / 关闭钩子由组件自己挂，控件由 initialize(fields) 交接。
		expect(composableEls.get('lightGetter'), '窗口根不该再登记').toBeFalsy();
		expect(document.getElementById('lightGetter'), '窗口根在 DOM 里').toBeTruthy();
		for (const id of ['lightGetter-type', 'lightGetter-presetId', 'lightGetter-variable']) {
			expect(composableEls.get(id), `${id} 不该再登记`).toBeFalsy();
		}
		a.unmount();

		const b = await mountSettle(ObjectGetter);
		expect(composableEls.get('objectGetter'), '窗口根不该再登记').toBeFalsy();
		expect(document.getElementById('objectGetter'), '窗口根在 DOM 里').toBeTruthy();
		for (const id of ['objectGetter-type', 'objectGetter-presetId', 'objectGetter-variable']) {
			expect(composableEls.get(id), `${id} 不该再登记`).toBeFalsy();
		}
		b.unmount();
	});

	it('注册表为空时模块侧安全 no-op（不再按 id 回退）', () => {
		composableEls.clear();
		expect(composableEls.get('lightGetter')).toBeUndefined();
		expect(composableEls.get('team-list')).toBeUndefined();
	});
});
