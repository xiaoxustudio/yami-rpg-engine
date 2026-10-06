import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import ActorGetterWindow from '@app/components/tools/ActorGetter.vue';
import AncestorGetterWindow from '@app/components/tools/AncestorGetter.vue';
import AngleGetterWindow from '@app/components/tools/AngleGetter.vue';
import ElementGetterWindow from '@app/components/tools/ElementGetter.vue';
import EquipmentGetterWindow from '@app/components/tools/EquipmentGetter.vue';
import ItemGetterWindow from '@app/components/tools/ItemGetter.vue';
import LightGetterWindow from '@app/components/tools/LightGetter.vue';
import ObjectGetterWindow from '@app/components/tools/ObjectGetter.vue';
import PositionGetterWindow from '@app/components/tools/PositionGetter.vue';
import RegionGetterWindow from '@app/components/tools/RegionGetter.vue';
import SkillGetterWindow from '@app/components/tools/SkillGetter.vue';
import StateGetterWindow from '@app/components/tools/StateGetter.vue';
import TilemapGetterWindow from '@app/components/tools/TilemapGetter.vue';
import TriggerGetterWindow from '@app/components/tools/TriggerGetter.vue';
import { useActorGetterWindow } from '@app/composables/useActorGetterWindow';
import { useAncestorGetterWindow } from '@app/composables/useAncestorGetterWindow';
import { useAngleGetterWindow } from '@app/composables/useAngleGetterWindow';
import { useElementGetterWindow } from '@app/composables/useElementGetterWindow';
import { useEquipmentGetterWindow } from '@app/composables/useEquipmentGetterWindow';
import { useItemGetterWindow } from '@app/composables/useItemGetterWindow';
import {
	useLightGetterWindow,
	useObjectGetterWindow
} from '@app/composables/usePresetGetterWindow';
import { usePositionGetterWindow } from '@app/composables/usePositionGetterWindow';
import { useRegionGetterWindow } from '@app/composables/useRegionGetterWindow';
import { useSkillGetterWindow } from '@app/composables/useSkillGetterWindow';
import { useStateGetterWindow } from '@app/composables/useStateGetterWindow';
import { useTilemapGetterWindow } from '@app/composables/useTilemapGetterWindow';
import { useTriggerGetterWindow } from '@app/composables/useTriggerGetterWindow';
import { ActorGetter } from '@app/commands/accessors/actor-accessor-window.ts';
import { AncestorGetter } from '@app/commands/accessors/ancestor-accessor-window.ts';
import { AngleGetter } from '@app/commands/accessors/angle-accessor-window.ts';
import { ElementGetter } from '@app/commands/accessors/element-accessor-window.ts';
import { EquipmentGetter } from '@app/commands/accessors/equipment-accessor-window.ts';
import { ItemGetter } from '@app/commands/accessors/item-accessor-window.ts';
import { LightGetter, ObjectGetter } from '@app/commands/accessors/preset-accessor-factory.ts';
import { PositionGetter } from '@app/commands/accessors/position-accessor-window.ts';
import { RegionGetter } from '@app/commands/accessors/region-accessor-window.ts';
import { SkillGetter } from '@app/commands/accessors/skill-accessor-window.ts';
import { StateGetter } from '@app/commands/accessors/state-accessor-window.ts';
import { TilemapGetter } from '@app/commands/accessors/tilemap-accessor-window.ts';
import { TriggerGetter } from '@app/commands/accessors/trigger-accessor-window.ts';
import { VariableGetter } from '@app/commands/accessors/variable-accessor-window.ts';
import { Window } from '@app/tools/window-object.ts';
import { Enum } from '@app/enum/enum-window.ts';

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ syncState: vi.fn() }),
	getLocalStore: () => ({ syncState: vi.fn() })
}));

vi.mock('@app/composables/usePresetElementWindow', () => ({
	usePresetElementWindow: () => ({ getDefaultPresetId: () => 'preset-0' }),
	PresetElement: { getDefaultPresetId: () => 'preset-0' }
}));

vi.mock('@app/composables/usePresetObjectWindow', () => ({
	usePresetObjectWindow: () => ({ getDefaultPresetId: vi.fn(() => 'preset-1') }),
	PresetObject: { getDefaultPresetId: vi.fn(() => 'preset-1') }
}));

const { mockWindow } = vi.hoisted(() => {
	const mockWindow = {
		initialize: vi.fn(),
		open: vi.fn(),
		isNone: vi.fn((variable: { key: string }) => variable.key === ''),
		loadPresetKeys: vi.fn(),
		checkDataForPlugin: vi.fn((data: { getter?: string }) => data?.getter === 'variable'),
		createDefaultForPlugin: vi.fn(() => ({ getter: 'variable', type: 'local', key: '' })),
		createVarListGenerator: vi.fn(),
		typeWrite: vi.fn(),
		typeInput: vi.fn(),
		confirm: vi.fn(),
		confirm2: vi.fn()
	};
	return { mockWindow };
});

vi.mock('@app/composables/useVariableGetterWindow', () => ({
	useVariableGetterWindow: () => mockWindow
}));

const makeTarget = (read?: () => unknown) => ({
	dataValue: undefined,
	read,
	input: vi.fn()
});

const makeVariableTarget = (overrides: Record<string, unknown> = {}) => ({
	filter: 'all',
	dataValue: { type: 'local', key: '' },
	input: vi.fn(),
	...overrides
});

describe('ActorGetter（角色访问器窗口转发契约）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('open 转发 composable 并解析 read 数据填充 form', async () => {
		const wrapper = mount(ActorGetterWindow, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const target = makeTarget(() => ({ type: 'member', memberId: 3 }));
		ActorGetter.open!(target as never);
		expect(Window.open).toHaveBeenCalledWith('actorGetter');
		expect(useActorGetterWindow().form.type).toBe('member');
		expect(useActorGetterWindow().form.memberId).toBe(3);
		wrapper.unmount();
	});

	it('confirm 转发 composable 并经 form 回调 target.input', async () => {
		const wrapper = mount(ActorGetterWindow, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const target = makeTarget(() => ({ type: 'by-id', presetId: 'preset-1' }));
		ActorGetter.open!(target as never);
		const actorGetter = useActorGetterWindow();
		actorGetter.form.type = 'by-id';
		actorGetter.form.presetId = 'preset-9';
		ActorGetter.confirm!({} as Event);
		expect(target.input).toHaveBeenCalledWith({ type: 'by-id', presetId: 'preset-9' });
		expect(Window.close).toHaveBeenCalledWith('actorGetter');
		wrapper.unmount();
	});

	it('checkDataForPlugin 匹配 getter=actor', () => {
		expect(ActorGetter.checkDataForPlugin!({ getter: 'actor' })).toBe(true);
		expect(ActorGetter.checkDataForPlugin!({ getter: 'skill' })).toBe(false);
		expect(ActorGetter.checkDataForPlugin!(null)).toBe(false);
	});

	it('createDefaultForPlugin 返回默认结构', () => {
		expect(ActorGetter.createDefaultForPlugin!()).toEqual({ getter: 'actor', type: 'trigger' });
	});
});

describe('AncestorGetter（祖先访问器窗口转发契约）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('open 转发 composable 并解析 read 数据填充 form', async () => {
		const wrapper = mount(AncestorGetterWindow, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const target = makeTarget(() => ({ type: 'by-id', presetId: 'preset-7' }));
		AncestorGetter.open!(target as never);
		expect(Window.open).toHaveBeenCalledWith('ancestorGetter');
		expect(useAncestorGetterWindow().form.type).toBe('by-id');
		wrapper.unmount();
	});

	it('confirm 转发 composable 并经 form 回调 target.input', async () => {
		const wrapper = mount(AncestorGetterWindow, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const target = makeTarget(() => ({ type: 'trigger' }));
		AncestorGetter.open!(target as never);
		const ancestorGetter = useAncestorGetterWindow();
		ancestorGetter.form.type = 'variable';
		ancestorGetter.form.variable = { type: 'local', key: 'v1' };
		AncestorGetter.confirm!({} as Event);
		expect(target.input).toHaveBeenCalledWith({
			type: 'variable',
			variable: { type: 'local', key: 'v1' }
		});
		expect(Window.close).toHaveBeenCalledWith('ancestorGetter');
		wrapper.unmount();
	});
});

describe('AngleGetter（角度访问器窗口转发契约）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('open 转发 composable 并解析 read 数据填充 form', async () => {
		const wrapper = mount(AngleGetterWindow, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const target = makeTarget(() => ({ type: 'absolute', degrees: 90 }));
		AngleGetter.open!(target as never);
		expect(Window.open).toHaveBeenCalledWith('angleGetter');
		expect(useAngleGetterWindow().form.type).toBe('absolute');
		wrapper.unmount();
	});

	it('confirm 转发 composable 并经 form 回调 target.input', async () => {
		const wrapper = mount(AngleGetterWindow, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const target = makeTarget(() => ({ type: 'absolute', degrees: 90 }));
		AngleGetter.open!(target as never);
		const angleGetter = useAngleGetterWindow();
		angleGetter.form.type = 'relative';
		angleGetter.form.degrees = 45;
		AngleGetter.confirm!({} as Event);
		expect(target.input).toHaveBeenCalledWith({ type: 'relative', degrees: 45 });
		expect(Window.close).toHaveBeenCalledWith('angleGetter');
		wrapper.unmount();
	});
});

describe('ElementGetter（元素访问器窗口转发契约）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('open 转发 composable 并解析 read 数据填充 form', async () => {
		const wrapper = mount(ElementGetterWindow, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const target = makeTarget(() => ({ type: 'by-id', presetId: 'preset-7' }));
		ElementGetter.open!(target as never);
		expect(Window.open).toHaveBeenCalledWith('elementGetter');
		expect(useElementGetterWindow().form.type).toBe('by-id');
		expect(useElementGetterWindow().form.presetId).toBe('preset-7');
		wrapper.unmount();
	});

	it('confirm 转发 composable 并经 form 回调 target.input', async () => {
		const wrapper = mount(ElementGetterWindow, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const target = makeTarget(() => ({ type: 'trigger' }));
		ElementGetter.open!(target as never);
		const elementGetter = useElementGetterWindow();
		elementGetter.form.type = 'by-ancestor-and-id';
		elementGetter.form.presetId = 'preset-8';
		ElementGetter.confirm!({} as Event);
		expect(target.input).toHaveBeenCalledWith({
			type: 'by-ancestor-and-id',
			ancestor: { type: 'trigger' },
			presetId: 'preset-8'
		});
		expect(Window.close).toHaveBeenCalledWith('elementGetter');
		wrapper.unmount();
	});

	it('checkDataForPlugin 匹配 getter=element', () => {
		expect(ElementGetter.checkDataForPlugin!({ getter: 'element' })).toBe(true);
		expect(ElementGetter.checkDataForPlugin!({ getter: 'actor' })).toBe(false);
	});

	it('createDefaultForPlugin 返回默认结构', () => {
		expect(ElementGetter.createDefaultForPlugin!()).toEqual({
			getter: 'element',
			type: 'trigger'
		});
	});
});

describe('EquipmentGetter（装备访问器窗口转发契约）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
		Enum.getDefStringId = vi.fn(() => 'slot-1');
		Enum.getStringItems = vi.fn(() => []);
	});

	it('open 转发 composable 并解析 read 数据填充 form', async () => {
		const wrapper = mount(EquipmentGetterWindow, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const target = makeTarget(() => ({ type: 'by-id-equipped', equipmentId: 'e1' }));
		EquipmentGetter.open!(target as never);
		expect(Window.open).toHaveBeenCalledWith('equipmentGetter');
		expect(useEquipmentGetterWindow().form.type).toBe('by-id-equipped');
		expect(Enum.getDefStringId).toHaveBeenCalledWith('equipment-slot');
		wrapper.unmount();
	});

	it('confirm 转发 composable 并经 form 回调 target.input', async () => {
		const wrapper = mount(EquipmentGetterWindow, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const target = makeTarget(() => ({ type: 'trigger' }));
		EquipmentGetter.open!(target as never);
		const equipmentGetter = useEquipmentGetterWindow();
		equipmentGetter.form.type = 'by-slot';
		equipmentGetter.form.slot = 'weapon';
		EquipmentGetter.confirm!({} as Event);
		expect(target.input).toHaveBeenCalledWith({
			type: 'by-slot',
			actor: { type: 'trigger' },
			slot: 'weapon'
		});
		expect(Window.close).toHaveBeenCalledWith('equipmentGetter');
		wrapper.unmount();
	});

	it('checkDataForPlugin 匹配 getter=equipment', () => {
		expect(EquipmentGetter.checkDataForPlugin!({ getter: 'equipment' })).toBe(true);
		expect(EquipmentGetter.checkDataForPlugin!({ getter: 'item' })).toBe(false);
	});

	it('createDefaultForPlugin 返回默认结构', () => {
		expect(EquipmentGetter.createDefaultForPlugin!()).toEqual({
			getter: 'equipment',
			type: 'trigger'
		});
	});
});

describe('ItemGetter（物品访问器窗口转发契约）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
		Enum.getDefStringId = vi.fn(() => 'key-1');
		Enum.getStringItems = vi.fn(() => []);
	});

	it('open 转发 composable 并解析 read 数据填充 form', async () => {
		const wrapper = mount(ItemGetterWindow, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const target = makeTarget(() => ({ type: 'by-id', itemId: 'i1' }));
		ItemGetter.open!(target as never);
		expect(Window.open).toHaveBeenCalledWith('itemGetter');
		expect(useItemGetterWindow().form.type).toBe('by-id');
		expect(Enum.getDefStringId).toHaveBeenCalledWith('shortcut-key');
		wrapper.unmount();
	});

	it('confirm 转发 composable 并经 form 回调 target.input', async () => {
		const wrapper = mount(ItemGetterWindow, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const target = makeTarget(() => ({ type: 'trigger' }));
		ItemGetter.open!(target as never);
		const itemGetter = useItemGetterWindow();
		itemGetter.form.type = 'by-id';
		itemGetter.form.itemId = 'i2';
		ItemGetter.confirm!({} as Event);
		expect(target.input).toHaveBeenCalledWith({
			type: 'by-id',
			actor: { type: 'trigger' },
			itemId: 'i2'
		});
		expect(Window.close).toHaveBeenCalledWith('itemGetter');
		wrapper.unmount();
	});

	it('checkDataForPlugin 匹配 getter=item', () => {
		expect(ItemGetter.checkDataForPlugin!({ getter: 'item' })).toBe(true);
		expect(ItemGetter.checkDataForPlugin!({ getter: 'skill' })).toBe(false);
	});

	it('createDefaultForPlugin 返回默认结构', () => {
		expect(ItemGetter.createDefaultForPlugin!()).toEqual({ getter: 'item', type: 'trigger' });
	});
});

describe('PositionGetter（位置访问器窗口转发契约）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('open 转发 composable 并解析 read 数据填充 form', async () => {
		const wrapper = mount(PositionGetterWindow, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const target = makeTarget(() => ({ type: 'absolute', x: 5, y: 9 }));
		PositionGetter.open!(target as never);
		expect(Window.open).toHaveBeenCalledWith('positionGetter');
		expect(usePositionGetterWindow().form.type).toBe('absolute');
		expect(usePositionGetterWindow().form.x).toBe(5);
		expect(usePositionGetterWindow().form.y).toBe(9);
		wrapper.unmount();
	});

	it('confirm 转发 composable 并经 form 回调 target.input', async () => {
		const wrapper = mount(PositionGetterWindow, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const target = makeTarget(() => ({ type: 'absolute', x: 1, y: 2 }));
		PositionGetter.open!(target as never);
		const positionGetter = usePositionGetterWindow();
		positionGetter.form.x = 10;
		positionGetter.form.y = 20;
		PositionGetter.confirm!({} as Event);
		expect(target.input).toHaveBeenCalledWith({ type: 'absolute', x: 10, y: 20 });
		expect(Window.close).toHaveBeenCalledWith('positionGetter');
		wrapper.unmount();
	});

	it('checkDataForPlugin 匹配 getter=position', () => {
		expect(PositionGetter.checkDataForPlugin!({ getter: 'position' })).toBe(true);
		expect(PositionGetter.checkDataForPlugin!({ getter: 'actor' })).toBe(false);
	});

	it('createDefaultForPlugin 返回默认结构', () => {
		expect(PositionGetter.createDefaultForPlugin!()).toEqual({
			getter: 'position',
			type: 'absolute',
			x: 0,
			y: 0
		});
	});
});

describe('RegionGetter（区域访问器窗口转发契约）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('open 转发 composable 并解析 read 数据填充 form', async () => {
		const wrapper = mount(RegionGetterWindow, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const target = makeTarget(() => ({ type: 'by-id', presetId: 'preset-7' }));
		RegionGetter.open!(target as never);
		expect(Window.open).toHaveBeenCalledWith('regionGetter');
		expect(useRegionGetterWindow().form.type).toBe('by-id');
		expect(useRegionGetterWindow().form.presetId).toBe('preset-7');
		wrapper.unmount();
	});

	it('confirm 转发 composable 并经 form 回调 target.input', async () => {
		const wrapper = mount(RegionGetterWindow, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const target = makeTarget(() => ({ type: 'trigger' }));
		RegionGetter.open!(target as never);
		const regionGetter = useRegionGetterWindow();
		regionGetter.form.type = 'by-id';
		regionGetter.form.presetId = 'preset-8';
		RegionGetter.confirm!({} as Event);
		expect(target.input).toHaveBeenCalledWith({ type: 'by-id', presetId: 'preset-8' });
		expect(Window.close).toHaveBeenCalledWith('regionGetter');
		wrapper.unmount();
	});
});

describe('SkillGetter（技能访问器窗口转发契约）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
		Enum.getDefStringId = vi.fn(() => 'key-1');
		Enum.getStringItems = vi.fn(() => []);
	});

	it('open 转发 composable 并解析 read 数据填充 form', async () => {
		const wrapper = mount(SkillGetterWindow, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const target = makeTarget(() => ({ type: 'by-id', skillId: 's1' }));
		SkillGetter.open!(target as never);
		expect(Window.open).toHaveBeenCalledWith('skillGetter');
		expect(useSkillGetterWindow().form.type).toBe('by-id');
		expect(Enum.getDefStringId).toHaveBeenCalledWith('shortcut-key');
		wrapper.unmount();
	});

	it('confirm 转发 composable 并经 form 回调 target.input', async () => {
		const wrapper = mount(SkillGetterWindow, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const target = makeTarget(() => ({ type: 'trigger' }));
		SkillGetter.open!(target as never);
		const skillGetter = useSkillGetterWindow();
		skillGetter.form.type = 'by-id';
		skillGetter.form.skillId = 's2';
		SkillGetter.confirm!({} as Event);
		expect(target.input).toHaveBeenCalledWith({
			type: 'by-id',
			actor: { type: 'trigger' },
			skillId: 's2'
		});
		expect(Window.close).toHaveBeenCalledWith('skillGetter');
		wrapper.unmount();
	});

	it('checkDataForPlugin 匹配 getter=skill', () => {
		expect(SkillGetter.checkDataForPlugin!({ getter: 'skill' })).toBe(true);
		expect(SkillGetter.checkDataForPlugin!({ getter: 'state' })).toBe(false);
	});

	it('createDefaultForPlugin 返回默认结构', () => {
		expect(SkillGetter.createDefaultForPlugin!()).toEqual({ getter: 'skill', type: 'trigger' });
	});
});

describe('StateGetter（状态访问器窗口转发契约）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('open 转发 composable 并解析 read 数据填充 form', async () => {
		const wrapper = mount(StateGetterWindow, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const target = makeTarget(() => ({ type: 'by-id', stateId: 'st1' }));
		StateGetter.open!(target as never);
		expect(Window.open).toHaveBeenCalledWith('stateGetter');
		expect(useStateGetterWindow().form.type).toBe('by-id');
		expect(useStateGetterWindow().form.stateId).toBe('st1');
		wrapper.unmount();
	});

	it('confirm 转发 composable 并经 form 回调 target.input', async () => {
		const wrapper = mount(StateGetterWindow, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const target = makeTarget(() => ({ type: 'trigger' }));
		StateGetter.open!(target as never);
		const stateGetter = useStateGetterWindow();
		stateGetter.form.type = 'by-id';
		stateGetter.form.stateId = 'st2';
		StateGetter.confirm!({} as Event);
		expect(target.input).toHaveBeenCalledWith({
			type: 'by-id',
			actor: { type: 'trigger' },
			stateId: 'st2'
		});
		expect(Window.close).toHaveBeenCalledWith('stateGetter');
		wrapper.unmount();
	});

	it('checkDataForPlugin 匹配 getter=state', () => {
		expect(StateGetter.checkDataForPlugin!({ getter: 'state' })).toBe(true);
		expect(StateGetter.checkDataForPlugin!({ getter: 'skill' })).toBe(false);
	});

	it('createDefaultForPlugin 返回默认结构', () => {
		expect(StateGetter.createDefaultForPlugin!()).toEqual({ getter: 'state', type: 'trigger' });
	});
});

describe('TilemapGetter（瓦片地图访问器窗口转发契约）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('open 转发 composable 并解析 read 数据填充 form', async () => {
		const wrapper = mount(TilemapGetterWindow, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const target = makeTarget(() => ({ type: 'by-id', presetId: 'preset-7' }));
		TilemapGetter.open!(target as never);
		expect(Window.open).toHaveBeenCalledWith('tilemapGetter');
		expect(useTilemapGetterWindow().form.type).toBe('by-id');
		expect(useTilemapGetterWindow().form.presetId).toBe('preset-7');
		wrapper.unmount();
	});

	it('confirm 转发 composable 并经 form 回调 target.input', async () => {
		const wrapper = mount(TilemapGetterWindow, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const target = makeTarget(() => ({ type: 'trigger' }));
		TilemapGetter.open!(target as never);
		const tilemapGetter = useTilemapGetterWindow();
		tilemapGetter.form.type = 'variable';
		tilemapGetter.form.variable = { type: 'local', key: 'v1' };
		TilemapGetter.confirm!({} as Event);
		expect(target.input).toHaveBeenCalledWith({
			type: 'variable',
			variable: { type: 'local', key: 'v1' }
		});
		expect(Window.close).toHaveBeenCalledWith('tilemapGetter');
		wrapper.unmount();
	});
});

describe('TriggerGetter（触发器访问器窗口转发契约）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('open 转发 composable 并解析 read 数据填充 form', async () => {
		const wrapper = mount(TriggerGetterWindow, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const target = makeTarget(() => ({
			type: 'variable',
			variable: { type: 'local', key: 'v1' }
		}));
		TriggerGetter.open!(target as never);
		expect(Window.open).toHaveBeenCalledWith('triggerGetter');
		expect(useTriggerGetterWindow().form.type).toBe('variable');
		expect(useTriggerGetterWindow().form.variable).toEqual({ type: 'local', key: 'v1' });
		wrapper.unmount();
	});

	it('confirm 转发 composable 并经 form 回调 target.input', async () => {
		const wrapper = mount(TriggerGetterWindow, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const target = makeTarget(() => ({ type: 'trigger' }));
		TriggerGetter.open!(target as never);
		const triggerGetter = useTriggerGetterWindow();
		triggerGetter.form.type = 'variable';
		triggerGetter.form.variable = { type: 'local', key: 'v2' };
		TriggerGetter.confirm!({} as Event);
		expect(target.input).toHaveBeenCalledWith({
			type: 'variable',
			variable: { type: 'local', key: 'v2' }
		});
		expect(Window.close).toHaveBeenCalledWith('triggerGetter');
		wrapper.unmount();
	});
});

describe('preset-accessor-factory（工厂生成的 LightGetter/ObjectGetter 转发契约）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('LightGetter.open 转发 composable 并解析 variable 数据填充 form', async () => {
		const wrapper = mount(LightGetterWindow, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const target = makeTarget(() => ({
			type: 'variable',
			variable: { type: 'local', key: 'v1' }
		}));
		LightGetter.open!(target as never);
		expect(Window.open).toHaveBeenCalledWith('lightGetter');
		expect(useLightGetterWindow().form.type).toBe('variable');
		expect(useLightGetterWindow().form.variable).toEqual({ type: 'local', key: 'v1' });
		wrapper.unmount();
	});

	it('LightGetter.confirm 转发 composable 并经 form 回调 target.input', async () => {
		const wrapper = mount(LightGetterWindow, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const target = makeTarget(() => ({ type: 'trigger' }));
		LightGetter.open!(target as never);
		LightGetter.confirm!({} as Event);
		expect(target.input).toHaveBeenCalledWith({ type: 'trigger' });
		expect(Window.close).toHaveBeenCalledWith('lightGetter');
		wrapper.unmount();
	});

	it('ObjectGetter 独立单例：open/confirm trigger 路径回调并关闭', async () => {
		const wrapper = mount(ObjectGetterWindow, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const target = makeTarget(() => ({ type: 'trigger' }));
		ObjectGetter.open!(target as never);
		expect(Window.open).toHaveBeenCalledWith('objectGetter');
		expect(useObjectGetterWindow().form.type).toBe('trigger');
		ObjectGetter.confirm!({} as Event);
		expect(target.input).toHaveBeenCalledWith({ type: 'trigger' });
		expect(Window.close).toHaveBeenCalledWith('objectGetter');
		wrapper.unmount();
	});
});

describe('VariableGetter（变量访问器窗口转发契约）', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		Window.isWindowOpen = vi.fn(() => false);
	});

	it('open 主窗口关闭时转发到 variableGetter 并传入 filter 与 prefix', () => {
		const target = makeVariableTarget();
		VariableGetter.open!(target as never);
		expect(mockWindow.open).toHaveBeenCalledWith(target, {
			filter: 'all',
			prefix: 'variableGetter'
		});
	});

	it('open 主窗口已打开时转发叠加窗口 variableGetter2', () => {
		Window.isWindowOpen = vi.fn(() => true);
		const target = makeVariableTarget();
		VariableGetter.open!(target as never);
		expect(mockWindow.open).toHaveBeenCalledWith(target, {
			filter: 'all',
			prefix: 'variableGetter2'
		});
	});

	it('open 未指定 filter 时默认为 all', () => {
		const target = makeVariableTarget({ filter: undefined });
		VariableGetter.open!(target as never);
		expect(mockWindow.open).toHaveBeenCalledWith(target, {
			filter: 'all',
			prefix: 'variableGetter'
		});
	});

	it('open 传入显式 filter 时透传', () => {
		const target = makeVariableTarget({ filter: 'number' });
		VariableGetter.open!(target as never);
		expect(mockWindow.open).toHaveBeenCalledWith(target, {
			filter: 'number',
			prefix: 'variableGetter'
		});
	});

	it('_openCore 转发 open 并透传 filter 与 prefix', () => {
		const target = makeVariableTarget();
		VariableGetter._openCore!(target as never, 'object', 'variableGetter2');
		expect(mockWindow.open).toHaveBeenCalledWith(target, {
			filter: 'object',
			prefix: 'variableGetter2'
		});
	});

	it('confirm 转发 confirm', () => {
		VariableGetter.confirm!({} as Event);
		expect(mockWindow.confirm).toHaveBeenCalled();
	});

	it('confirm2 转发 confirm2', () => {
		VariableGetter.confirm2!({} as Event);
		expect(mockWindow.confirm2).toHaveBeenCalled();
	});

	it('_confirmCore 按 prefix 转发 confirm/confirm2', () => {
		VariableGetter._confirmCore!('variableGetter2');
		expect(mockWindow.confirm2).toHaveBeenCalled();
		VariableGetter._confirmCore!('variableGetter');
		expect(mockWindow.confirm).toHaveBeenCalled();
	});

	it('initialize 转发 initialize', () => {
		VariableGetter.initialize!();
		expect(mockWindow.initialize).toHaveBeenCalled();
	});

	it('loadPresetKeys 转发 loadPresetKeys', () => {
		VariableGetter.loadPresetKeys!('number');
		expect(mockWindow.loadPresetKeys).toHaveBeenCalledWith('number');
	});

	it('isNone 透传空 key 判断', () => {
		expect(VariableGetter.isNone!({ key: '' })).toBe(true);
		expect(VariableGetter.isNone!({ key: 'v1' })).toBe(false);
		expect(mockWindow.isNone).toHaveBeenCalledWith({ key: '' });
	});

	it('checkDataForPlugin 透传 getter 判断', () => {
		expect(VariableGetter.checkDataForPlugin!({ getter: 'variable' })).toBe(true);
		expect(VariableGetter.checkDataForPlugin!({ getter: 'actor' })).toBe(false);
	});

	it('createDefaultForPlugin 返回默认结构', () => {
		expect(VariableGetter.createDefaultForPlugin!()).toEqual({
			getter: 'variable',
			type: 'local',
			key: ''
		});
	});

	it('typeWrite/typeInput 转发', () => {
		const ev = { value: 'actor' } as Event & { value: string };
		VariableGetter.typeWrite!(ev);
		VariableGetter.typeInput!(ev);
		expect(mockWindow.typeWrite).toHaveBeenCalledWith(ev);
		expect(mockWindow.typeInput).toHaveBeenCalledWith(ev);
	});
});
