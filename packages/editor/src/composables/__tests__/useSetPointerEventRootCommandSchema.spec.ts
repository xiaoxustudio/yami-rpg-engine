import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { markRaw } from 'vue';
import { mount } from '@vue/test-utils';
import SetPointerEventRoot from '@app/components/commands/SetPointerEventRoot.vue';
import {
	Command,
	initCommandColorBridges,
	initCommandParseBridges
} from '@app/commands/command-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { useSetPointerEventRootCommandSchema } from '@app/composables/commands/useSetPointerEventRootCommandSchema';
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

interface ControlEl extends HTMLElement {
	read(): unknown;
	write(value: unknown): void;
	input(value: unknown): void;
}

const getControl = (id: string): ControlEl => document.getElementById(id) as unknown as ControlEl;

const target = {
	scrollAndResize: vi.fn(),
	getSelectionPosition: () => ({ x: 100, y: 100 }),
	save: vi.fn()
};

describe('useSetPointerEventRootCommandSchema（setPointerEventRoot 命令表单 composable：insert/edit/save/parse 路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Command.words = markRaw(new Command.WordList());
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('insert 路径：打开窗口并 load 默认 form', async () => {
		const wrapper = mount(SetPointerEventRoot, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useSetPointerEventRootCommandSchema();
		CommandSchema.insert(target, 'setPointerEventRoot');
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('setPointerEventRoot');
		expect(form.operation).toBe('add');
		expect(form.element).toEqual({ type: 'trigger' });
		wrapper.unmount();
	});

	it('edit 路径：handler.load 解构 params 到 form', async () => {
		const wrapper = mount(SetPointerEventRoot, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useSetPointerEventRootCommandSchema();
		CommandSchema.edit(target, {
			id: 'setPointerEventRoot',
			params: { operation: 'remove', element: { type: 'latest' } }
		});
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('setPointerEventRoot');
		expect(form.operation).toBe('remove');
		expect(form.element).toEqual({ type: 'latest' });
		wrapper.unmount();
	});

	it('save 路径：operation=add 时保存 element', async () => {
		const wrapper = mount(SetPointerEventRoot, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.setPointerEventRoot.customLoad!({
			operation: 'add',
			element: { type: 'trigger' }
		});
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.setPointerEventRoot.save!();
		expect(saved).toHaveBeenCalledWith({ operation: 'add', element: { type: 'trigger' } });
		wrapper.unmount();
	});

	it('save 路径：operation=remove-latest 时仅保存 operation', async () => {
		const wrapper = mount(SetPointerEventRoot, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.setPointerEventRoot.customLoad!({
			operation: 'add',
			element: { type: 'trigger' }
		});
		getControl('setPointerEventRoot-operation').write('remove-latest');
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.setPointerEventRoot.save!();
		expect(saved).toHaveBeenCalledWith({ operation: 'remove-latest' });
		wrapper.unmount();
	});

	it('parse 路径：operation=set 按 add 渲染 element 文本', () => {
		const contents = Command.cases.setPointerEventRoot.parse!({
			operation: 'set',
			element: { type: 'trigger' }
		});
		expect(contents[0]).toEqual({ color: 'element' });
		expect(contents[1].text).toContain('command.setPointerEventRoot');
		expect(contents[2].text).toContain('command.setPointerEventRoot.add');
		expect(contents[2].text).toContain('[element:trigger]');
	});
});
