import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { markRaw } from 'vue';
import { mount } from '@vue/test-utils';
import SetItem from '@app/components/commands/SetItem.vue';
import {
	Command,
	initCommandColorBridges,
	initCommandParseBridges
} from '@app/commands/command-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { useSetItemCommandSchema } from '@app/composables/commands/useSetItemCommandSchema';
import { Window } from '@app/tools/window-object.ts';

vi.mock('@app/composables/useCommandParse.ts', () => ({
	parseVariable: (value: unknown) => `[var:${(value as { key?: string })?.key ?? ''}]`,
	parseGlobalVariable: (value: unknown) => `[gvar:${value}]`,
	parseVariableNumber: (value: unknown, unit = '') => `[num:${value}]${unit}`,
	parseVariableString: (value: unknown) => `[str:${value}]`,
	parseVariableFile: (value: unknown) => `[file:${value}]`,
	parseMultiLineString: (value: unknown) => String(value),
	parseActor: (value: unknown) => `[actor:${(value as { type?: string })?.type ?? value}]`,
	parseEnumString: (value: unknown) => `[enum:${value}]`,
	parseFileName: (value: unknown) => `[file:${value}]`,
	parseAudioType: (value: unknown) => `[audio:${value}]`,
	parseWait: (value: unknown) => (value ? '[wait]' : ''),
	parseEasing: (value: unknown) => `[easing:${value}]`,
	parsePosition: (value: unknown) => `[pos:${(value as { type?: string })?.type}]`,
	parseElement: (value: unknown) => `[element:${(value as { type?: string })?.type ?? value}]`,
	parseItem: (value: unknown) => `[item:${(value as { type?: string })?.type ?? value}]`,
	parseHexColor: (value: unknown) => `[hex:${value}]`,
	parseAttributeGroup: (value: unknown) => `[attrGroup:${value}]`,
	parseEnumGroup: (value: unknown) => `[enumGroup:${value}]`,
	parseTextTags: (value: unknown) => value,
	removeTextTags: (value: unknown) => value,
	parseBlend: () => undefined,
	fetchVariables: () => undefined,
	parseAttributeKey: () => undefined,
	parseAttributeTag: () => undefined,
	parseVariableTag: () => undefined,
	parseVariableTemplate: () => undefined,
	parseVariableAttr: () => undefined,
	parseVariableEnum: () => undefined,
	parseVariableTeam: () => undefined,
	parseSpriteName: () => undefined,
	parseEventType: () => undefined,
	parseEnumStringTag: () => undefined,
	parseGroupEnumString: () => undefined,
	parseListItem: () => undefined,
	parseParameter: () => undefined,
	parseSkill: () => undefined,
	parseState: () => undefined,
	parseEquipment: () => undefined,
	parseAngle: () => undefined,
	parseTrigger: () => undefined,
	parseLight: () => undefined,
	parseRegion: () => undefined,
	parseTilemap: () => undefined,
	parseObject: () => undefined,
	parsePresetObject: () => undefined,
	parsePresetElement: () => undefined,
	parseTeam: () => undefined,
	parseActorSelector: () => undefined,
	parseUnlinkedId: () => undefined
}));

initCommandColorBridges();
initCommandParseBridges();

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ getLabel: () => '', syncState: vi.fn() })
}));

const target = {
	scrollAndResize: vi.fn(),
	getSelectionPosition: () => ({ x: 100, y: 100 }),
	save: vi.fn()
};

describe('useSetItemCommandSchema（setItem 命令表单 composable：insert/edit/save/parse 路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Command.words = markRaw(new Command.WordList());
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('insert 路径：打开窗口并 load 默认 form', async () => {
		const wrapper = mount(SetItem, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useSetItemCommandSchema();
		CommandSchema.insert(target, 'setItem');
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('setItem');
		expect(form.item).toEqual({ type: 'trigger' });
		expect(form.operation).toBe('increase');
		expect(form.quantity).toBe(1);
		wrapper.unmount();
	});

	it('edit 路径：handler.load 解构 params 到 form', async () => {
		const wrapper = mount(SetItem, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useSetItemCommandSchema();
		CommandSchema.edit(target, {
			id: 'setItem',
			params: { item: { type: 'latest' }, operation: 'decrease', quantity: 5 }
		});
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('setItem');
		expect(form.item).toEqual({ type: 'latest' });
		expect(form.operation).toBe('decrease');
		expect(form.quantity).toBe(5);
		wrapper.unmount();
	});

	it('save 路径：用户改 form 后经 Command.cases.setItem.save 保存', async () => {
		const wrapper = mount(SetItem, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useSetItemCommandSchema();
		Command.cases.setItem.customLoad!({
			item: { type: 'trigger' },
			operation: 'increase',
			quantity: 1
		});
		form.operation = 'decrease';
		form.quantity = 3;
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.setItem.save!();
		expect(saved).toHaveBeenCalledWith({
			item: { type: 'trigger' },
			operation: 'decrease',
			quantity: 3
		});
		wrapper.unmount();
	});

	it('parse 路径：customParse 渲染 item/operation/quantity 文本', () => {
		const contents = Command.cases.setItem.parse!({
			item: { type: 'trigger' },
			operation: 'increase',
			quantity: 2
		});
		expect(contents[0]).toEqual({ color: 'inventory' });
		expect(contents[1].text).toContain('command.setItem');
		expect(contents[2].text).toContain('[item:trigger]');
		expect(contents[2].text).toContain('command.setItem.increase');
		expect(contents[2].text).toContain('[num:2]');
	});
});
