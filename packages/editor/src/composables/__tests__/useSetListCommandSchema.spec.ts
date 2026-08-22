import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { markRaw } from 'vue';
import { mount } from '@vue/test-utils';
import SetList from '@app/components/commands/SetList.vue';
import {
	Command,
	initCommandColorBridges,
	initCommandParseBridges
} from '@app/commands/command-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { VariableGetter } from '@app/commands/accessors/variable-accessor-window.ts';
import { useSetListCommandSchema } from '@app/composables/commands/useSetListCommandSchema';
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

describe('useSetListCommandSchema（setList 命令表单 composable：insert/edit/save/parse 路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Command.words = markRaw(new Command.WordList());
		VariableGetter.isNone = (variable: unknown) =>
			!variable || (variable as { key?: string })?.key === '';
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('insert 路径：打开窗口并 load 默认 form', async () => {
		const wrapper = mount(SetList, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useSetListCommandSchema();
		CommandSchema.insert(target, 'setList');
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('setList');
		expect(form.variable).toEqual({ type: 'local', key: '' });
		expect(form.operation).toBe('set-empty');
		expect(form.indexSkipCheck).toBe(true);
		wrapper.unmount();
	});

	it('edit 路径：customLoad 解构 params（list→numbers）到 form', async () => {
		const wrapper = mount(SetList, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useSetListCommandSchema();
		CommandSchema.edit(target, {
			id: 'setList',
			params: {
				variable: { type: 'local', key: 'foo' },
				operation: 'set-numbers',
				list: [1, 2, 3]
			}
		});
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('setList');
		expect(form.variable).toEqual({ type: 'local', key: 'foo' });
		expect(form.operation).toBe('set-numbers');
		expect(form.numbers).toEqual([1, 2, 3]);
		wrapper.unmount();
	});

	it('save 路径：variable 无效校验失败不保存', async () => {
		const wrapper = mount(SetList, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.setList.customLoad!({
			variable: { type: 'none', key: '' },
			operation: 'set-empty'
		});
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.setList.save!();
		expect(saved).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('save 路径：operation=set-empty 时保存 variable/operation', async () => {
		const wrapper = mount(SetList, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.setList.customLoad!({
			variable: { type: 'local', key: 'foo' },
			operation: 'set-empty'
		});
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.setList.save!();
		expect(saved).toHaveBeenCalledWith({
			variable: { type: 'local', key: 'foo' },
			operation: 'set-empty'
		});
		wrapper.unmount();
	});

	it('save 路径：operation=set-numbers 且 list 为空校验失败不保存', async () => {
		const wrapper = mount(SetList, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.setList.customLoad!({
			variable: { type: 'local', key: 'foo' },
			operation: 'set-numbers',
			list: []
		});
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.setList.save!();
		expect(saved).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('save 路径：operation=set-numbers 时保存 list', async () => {
		const wrapper = mount(SetList, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.setList.customLoad!({
			variable: { type: 'local', key: 'foo' },
			operation: 'set-numbers',
			list: [1, 2]
		});
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.setList.save!();
		expect(saved).toHaveBeenCalledWith({
			variable: { type: 'local', key: 'foo' },
			operation: 'set-numbers',
			list: [1, 2]
		});
		wrapper.unmount();
	});

	it('save 路径：operation=set-boolean 时保存 index/constant/skipCheck', async () => {
		const wrapper = mount(SetList, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.setList.customLoad!({
			variable: { type: 'local', key: 'foo' },
			operation: 'set-boolean',
			index: 2,
			constant: true,
			skipCheck: false
		});
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.setList.save!();
		expect(saved).toHaveBeenCalledWith({
			variable: { type: 'local', key: 'foo' },
			operation: 'set-boolean',
			index: 2,
			constant: true,
			skipCheck: false
		});
		wrapper.unmount();
	});

	it('save 路径：operation=push 时保存 operand', async () => {
		const wrapper = mount(SetList, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.setList.customLoad!({
			variable: { type: 'local', key: 'foo' },
			operation: 'push',
			operand: { type: 'local', key: 'bar' }
		});
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.setList.save!();
		expect(saved).toHaveBeenCalledWith({
			variable: { type: 'local', key: 'foo' },
			operation: 'push',
			operand: { type: 'local', key: 'bar' }
		});
		wrapper.unmount();
	});

	it('save 路径：operation=set-variable 且 operand 无效校验失败不保存', async () => {
		const wrapper = mount(SetList, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.setList.customLoad!({
			variable: { type: 'local', key: 'foo' },
			operation: 'set-variable',
			index: 0,
			operand: { type: 'local', key: '' }
		});
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.setList.save!();
		expect(saved).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('parse 路径：operation=set-empty 渲染变量列表文本', () => {
		const contents = Command.cases.setList.parse!({
			variable: { type: 'local', key: 'foo' },
			operation: 'set-empty'
		});
		expect(contents[0]).toEqual({ color: 'variable' });
		expect(contents[1].text).toContain('command.setList.alias');
		expect(contents[3].text).toContain('[var:foo]');
	});

	it('parse 路径：operation=set-boolean 渲染常量与 skipCheck 文本', () => {
		const contents = Command.cases.setList.parse!({
			variable: { type: 'local', key: 'foo' },
			operation: 'set-boolean',
			index: 2,
			constant: true,
			skipCheck: true
		});
		expect(contents[0]).toEqual({ color: 'variable' });
		expect(contents[3].text).toContain('[var:foo]');
		expect(contents[3].text).toContain('command.setList.skipCheck');
	});
});
