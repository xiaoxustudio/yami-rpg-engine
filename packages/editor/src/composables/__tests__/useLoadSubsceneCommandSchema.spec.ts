import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { markRaw } from 'vue';
import { mount } from '@vue/test-utils';
import LoadSubscene from '@app/components/commands/LoadSubscene.vue';
import {
	Command,
	initCommandColorBridges,
	initCommandParseBridges
} from '@app/commands/command-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { useLoadSubsceneCommandSchema } from '@app/composables/commands/useLoadSubsceneCommandSchema';
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

describe('useLoadSubsceneCommandSchema（loadSubscene 命令表单 composable：insert/edit/save/parse 路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Command.words = markRaw(new Command.WordList());
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('insert 路径：打开窗口并 load 默认 form', async () => {
		const wrapper = mount(LoadSubscene, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useLoadSubsceneCommandSchema();
		CommandSchema.insert(target, 'loadSubscene');
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('loadSubscene');
		expect(form.sceneId).toBe('');
		expect(form.shiftX).toBe(0);
		expect(form.shiftY).toBe(0);
		wrapper.unmount();
	});

	it('edit 路径：handler.load 解构 params 到 form', async () => {
		const wrapper = mount(LoadSubscene, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useLoadSubsceneCommandSchema();
		CommandSchema.edit(target, {
			id: 'loadSubscene',
			params: { sceneId: 'scene1', shiftX: 5, shiftY: 6 }
		});
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('loadSubscene');
		expect(form.sceneId).toBe('scene1');
		expect(form.shiftX).toBe(5);
		expect(form.shiftY).toBe(6);
		wrapper.unmount();
	});

	it('save 路径：sceneId 为空时校验失败不保存', async () => {
		const wrapper = mount(LoadSubscene, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.loadSubscene.customLoad!({ sceneId: '', shiftX: 0, shiftY: 0 });
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.loadSubscene.save!();
		expect(saved).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('save 路径：用户改 form 后经 Command.cases.loadSubscene.save 保存', async () => {
		const wrapper = mount(LoadSubscene, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useLoadSubsceneCommandSchema();
		Command.cases.loadSubscene.customLoad!({ sceneId: 'scene1', shiftX: 10, shiftY: 20 });
		form.sceneId = 'scene2';
		form.shiftX = 30;
		form.shiftY = 40;
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.loadSubscene.save!();
		expect(saved).toHaveBeenCalledWith({ sceneId: 'scene2', shiftX: 30, shiftY: 40 });
		wrapper.unmount();
	});

	it('parse 路径：customParse 渲染 scene/shift 文本', () => {
		const contents = Command.cases.loadSubscene.parse!({
			sceneId: 'scene1',
			shiftX: 5,
			shiftY: 6
		});
		expect(contents[0]).toEqual({ color: 'scene' });
		expect(contents[1].text).toContain('command.loadSubscene');
		expect(contents[2].text).toContain('[file:scene1]');
		expect(contents[2].text).toContain('[num:5]');
		expect(contents[2].text).toContain('[num:6]');
	});
});
