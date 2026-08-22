import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { markRaw } from 'vue';
import { mount } from '@vue/test-utils';
import SetPartyMember from '@app/components/commands/SetPartyMember.vue';
import {
	Command,
	initCommandColorBridges,
	initCommandParseBridges
} from '@app/commands/command-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { useSetPartyMemberCommandSchema } from '@app/composables/commands/useSetPartyMemberCommandSchema';
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

describe('useSetPartyMemberCommandSchema（setPartyMember 命令表单 composable：insert/edit/save/parse 路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Command.words = markRaw(new Command.WordList());
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('insert 路径：打开窗口并 load 默认 form', async () => {
		const wrapper = mount(SetPartyMember, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useSetPartyMemberCommandSchema();
		CommandSchema.insert(target, 'setPartyMember');
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('setPartyMember');
		expect(form.operation).toBe('add');
		expect(form.actor).toEqual({ type: 'trigger' });
		wrapper.unmount();
	});

	it('edit 路径：handler.load 解构 params 到 form', async () => {
		const wrapper = mount(SetPartyMember, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useSetPartyMemberCommandSchema();
		CommandSchema.edit(target, {
			id: 'setPartyMember',
			params: { operation: 'remove', actor: { type: 'latest' } }
		});
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('setPartyMember');
		expect(form.operation).toBe('remove');
		expect(form.actor).toEqual({ type: 'latest' });
		wrapper.unmount();
	});

	it('save 路径：用户改 form 后经 Command.cases.setPartyMember.save 保存', async () => {
		const wrapper = mount(SetPartyMember, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useSetPartyMemberCommandSchema();
		Command.cases.setPartyMember.customLoad!({
			operation: 'add',
			actor: { type: 'trigger' }
		});
		form.operation = 'remove';
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.setPartyMember.save!();
		expect(saved).toHaveBeenCalledWith({ operation: 'remove', actor: { type: 'trigger' } });
		wrapper.unmount();
	});

	it('parse 路径：customParse 渲染 operation/actor 文本', () => {
		const contents = Command.cases.setPartyMember.parse!({
			operation: 'add',
			actor: { type: 'trigger' }
		});
		expect(contents[0]).toEqual({ color: 'actor' });
		expect(contents[1].text).toContain('command.setPartyMember');
		expect(contents[2].text).toContain('command.setPartyMember.add');
		expect(contents[2].text).toContain('[actor:trigger]');
	});
});
