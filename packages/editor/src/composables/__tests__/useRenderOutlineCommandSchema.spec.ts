import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { markRaw } from 'vue';
import { mount } from '@vue/test-utils';
import RenderOutline from '@app/components/commands/RenderOutline.vue';
import {
	Command,
	initCommandColorBridges,
	initCommandParseBridges
} from '@app/commands/command-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { useRenderOutlineCommandSchema } from '@app/composables/commands/useRenderOutlineCommandSchema';
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

describe('useRenderOutlineCommandSchema（renderOutline 命令表单 composable：insert/edit/save/parse 路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Command.words = markRaw(new Command.WordList());
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('insert 路径：打开窗口并 load 默认 form', async () => {
		const wrapper = mount(RenderOutline, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useRenderOutlineCommandSchema();
		CommandSchema.insert(target, 'renderOutline');
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('renderOutline');
		expect(form.operation).toBe('add');
		expect(form.color).toBe('ffffffff');
		wrapper.unmount();
	});

	it('edit 路径：handler.load 解构 params 到 form', async () => {
		const wrapper = mount(RenderOutline, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useRenderOutlineCommandSchema();
		CommandSchema.edit(target, {
			id: 'renderOutline',
			params: { operation: 'remove', actor: { type: 'latest' }, color: 'ff0000' }
		});
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('renderOutline');
		expect(form.operation).toBe('remove');
		expect(form.actor).toEqual({ type: 'latest' });
		wrapper.unmount();
	});

	it('save 路径：operation=add 时保存 actor/color', async () => {
		const wrapper = mount(RenderOutline, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.renderOutline.customLoad!({
			operation: 'add',
			actor: { type: 'trigger' },
			color: 'ffffffff'
		});
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.renderOutline.save!();
		expect(saved).toHaveBeenCalledWith({
			operation: 'add',
			actor: { type: 'trigger' },
			color: 'ffffffff'
		});
		wrapper.unmount();
	});

	it('save 路径：operation=remove 时仅保存 actor', async () => {
		const wrapper = mount(RenderOutline, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.renderOutline.customLoad!({
			operation: 'add',
			actor: { type: 'trigger' },
			color: 'ffffffff'
		});
		getControl('renderOutline-operation').write('remove');
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.renderOutline.save!();
		expect(saved).toHaveBeenCalledWith({ operation: 'remove', actor: { type: 'trigger' } });
		wrapper.unmount();
	});

	it('save 路径：operation=reset 时仅保存 operation', async () => {
		const wrapper = mount(RenderOutline, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.renderOutline.customLoad!({
			operation: 'add',
			actor: { type: 'trigger' },
			color: 'ffffffff'
		});
		getControl('renderOutline-operation').write('reset');
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.renderOutline.save!();
		expect(saved).toHaveBeenCalledWith({ operation: 'reset' });
		wrapper.unmount();
	});

	it('parse 路径：operation=add 渲染含颜色的文本', () => {
		const contents = Command.cases.renderOutline.parse!({
			operation: 'add',
			actor: { type: 'trigger' },
			color: 'ffffffff'
		});
		expect(contents[0]).toEqual({ color: 'flow' });
		expect(contents[1].text).toContain('command.renderOutline');
		expect(contents[2].text).toContain('command.renderOutline.add');
		expect(contents[2].text).toContain('[actor:trigger]');
		expect(contents[2].text).toContain('[hex:ffffff]');
	});
});
