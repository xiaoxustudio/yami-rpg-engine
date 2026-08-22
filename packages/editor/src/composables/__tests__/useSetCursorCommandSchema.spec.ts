import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { markRaw } from 'vue';
import { mount } from '@vue/test-utils';
import SetCursor from '@app/components/commands/SetCursor.vue';
import {
	Command,
	initCommandColorBridges,
	initCommandParseBridges
} from '@app/commands/command-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { useSetCursorCommandSchema } from '@app/composables/commands/useSetCursorCommandSchema';
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

describe('useSetCursorCommandSchema（setCursor 命令表单 composable：insert/edit/save/parse 路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Command.words = markRaw(new Command.WordList());
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('insert 路径：打开窗口并 load 默认 form', async () => {
		const wrapper = mount(SetCursor, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useSetCursorCommandSchema();
		CommandSchema.insert(target, 'setCursor');
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('setCursor');
		expect(form.image).toBe('');
		wrapper.unmount();
	});

	it('edit 路径：handler.load 解构 params 到 form', async () => {
		const wrapper = mount(SetCursor, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useSetCursorCommandSchema();
		CommandSchema.edit(target, { id: 'setCursor', params: { image: 'cursor.png' } });
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('setCursor');
		expect(form.image).toBe('cursor.png');
		wrapper.unmount();
	});

	it('save 路径：用户改 form 后经 Command.cases.setCursor.save 保存', async () => {
		const wrapper = mount(SetCursor, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useSetCursorCommandSchema();
		Command.cases.setCursor.customLoad!({ image: '' });
		form.image = 'hand.png';
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.setCursor.save!();
		expect(saved).toHaveBeenCalledWith({ image: 'hand.png' });
		wrapper.unmount();
	});

	it('parse 路径：customParse 渲染 image 文本', () => {
		const contents = Command.cases.setCursor.parse!({ image: 'hand.png' });
		expect(contents[0]).toEqual({ color: 'system' });
		expect(contents[1].text).toContain('command.setCursor');
		expect(contents[2].text).toBe('[file:hand.png]');
	});
});
