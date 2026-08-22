import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { markRaw } from 'vue';
import { mount } from '@vue/test-utils';
import SetMovementSpeed from '@app/components/commands/SetMovementSpeed.vue';
import {
	Command,
	initCommandColorBridges,
	initCommandParseBridges
} from '@app/commands/command-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { useSetMovementSpeedCommandSchema } from '@app/composables/commands/useSetMovementSpeedCommandSchema';
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

describe('useSetMovementSpeedCommandSchema（setMovementSpeed 命令表单 composable：insert/edit/save/parse 路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Command.words = markRaw(new Command.WordList());
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('insert 路径：打开窗口并 load 默认 form', async () => {
		const wrapper = mount(SetMovementSpeed, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useSetMovementSpeedCommandSchema();
		CommandSchema.insert(target, 'setMovementSpeed');
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('setMovementSpeed');
		expect(form.actor).toEqual({ type: 'trigger' });
		expect(form.property).toBe('base');
		expect(form.base).toBe(0);
		wrapper.unmount();
	});

	it('edit 路径：handler.load 解构 params 到 form', async () => {
		const wrapper = mount(SetMovementSpeed, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useSetMovementSpeedCommandSchema();
		CommandSchema.edit(target, {
			id: 'setMovementSpeed',
			params: { actor: { type: 'latest' }, property: 'factor', factor: 2 }
		});
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('setMovementSpeed');
		expect(form.actor).toEqual({ type: 'latest' });
		expect(form.property).toBe('factor');
		expect(form.factor).toBe(2);
		wrapper.unmount();
	});

	it('save 路径：property=base 时保存 base', async () => {
		const wrapper = mount(SetMovementSpeed, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.setMovementSpeed.customLoad!({
			actor: { type: 'trigger' },
			property: 'base',
			base: 0,
			factor: 0
		});
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.setMovementSpeed.save!();
		expect(saved).toHaveBeenCalledWith({
			actor: { type: 'trigger' },
			property: 'base',
			base: 0
		});
		wrapper.unmount();
	});

	it('save 路径：property=factor 时保存 factor', async () => {
		const wrapper = mount(SetMovementSpeed, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.setMovementSpeed.customLoad!({
			actor: { type: 'trigger' },
			property: 'base',
			base: 0,
			factor: 0
		});
		getControl('setMovementSpeed-property').write('factor');
		getControl('setMovementSpeed-factor').write(2.5);
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.setMovementSpeed.save!();
		expect(saved).toHaveBeenCalledWith({
			actor: { type: 'trigger' },
			property: 'factor',
			factor: 2.5
		});
		wrapper.unmount();
	});

	it('parse 路径：property=base 渲染 base 文本', () => {
		const contents = Command.cases.setMovementSpeed.parse!({
			actor: { type: 'trigger' },
			property: 'base',
			base: 8,
			factor: 0
		});
		expect(contents[0]).toEqual({ color: 'actor' });
		expect(contents[1].text).toContain('command.setMovementSpeed');
		expect(contents[2].text).toContain('[actor:trigger]');
		expect(contents[2].text).toContain('[num:8]t/s');
	});
});
