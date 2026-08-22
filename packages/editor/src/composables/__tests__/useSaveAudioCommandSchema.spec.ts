import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { markRaw } from 'vue';
import { mount } from '@vue/test-utils';
import SaveAudio from '@app/components/commands/SaveAudio.vue';
import {
	Command,
	initCommandColorBridges,
	initCommandParseBridges
} from '@app/commands/command-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { useSaveAudioCommandSchema } from '@app/composables/commands/useSaveAudioCommandSchema';
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

describe('useSaveAudioCommandSchema（saveAudio 命令表单 composable：insert/edit/save/parse 路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Command.words = markRaw(new Command.WordList());
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('insert 路径：打开窗口并 load 默认 form', async () => {
		const wrapper = mount(SaveAudio, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useSaveAudioCommandSchema();
		CommandSchema.insert(target, 'saveAudio');
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('saveAudio');
		expect(form.type).toBe('bgm');
		wrapper.unmount();
	});

	it('edit 路径：handler.load 解构 params 到 form', async () => {
		const wrapper = mount(SaveAudio, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useSaveAudioCommandSchema();
		CommandSchema.edit(target, { id: 'saveAudio', params: { type: 'bgs' } });
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('saveAudio');
		expect(form.type).toBe('bgs');
		wrapper.unmount();
	});

	it('save 路径：用户改 form 后经 Command.cases.saveAudio.save 保存', async () => {
		const wrapper = mount(SaveAudio, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useSaveAudioCommandSchema();
		Command.cases.saveAudio.customLoad!({ type: 'bgm' });
		form.type = 'se';
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.saveAudio.save!();
		expect(saved).toHaveBeenCalledWith({ type: 'se' });
		wrapper.unmount();
	});

	it('parse 路径：customParse 渲染 type 文本', () => {
		const contents = Command.cases.saveAudio.parse!({ type: 'bgm' });
		expect(contents[0]).toEqual({ color: 'audio' });
		expect(contents[1].text).toContain('command.saveAudio');
		expect(contents[2].text).toBe('[audio:bgm]');
	});
});
