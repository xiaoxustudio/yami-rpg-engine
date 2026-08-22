import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { markRaw } from 'vue';
import { mount } from '@vue/test-utils';
import SetAmbientLight from '@app/components/commands/SetAmbientLight.vue';
import {
	Command,
	initCommandColorBridges,
	initCommandParseBridges
} from '@app/commands/command-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { useSetAmbientLightCommandSchema } from '@app/composables/commands/useSetAmbientLightCommandSchema';
import { Data } from '@app/data/data-object.ts';
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

describe('useSetAmbientLightCommandSchema（setAmbientLight 命令表单 composable：insert/edit/save/parse 路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Command.words = markRaw(new Command.WordList());
		Data.easings = [{ id: 'easing0', name: 'Linear' }] as never;
		Data.createEasingItems = vi.fn(() => [{ name: 'Linear', value: 'easing0' }]) as never;
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('insert 路径：打开窗口并 load 默认 form', async () => {
		const wrapper = mount(SetAmbientLight, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useSetAmbientLightCommandSchema();
		CommandSchema.insert(target, 'setAmbientLight');
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('setAmbientLight');
		expect(form.red).toBe(0);
		expect(form.green).toBe(0);
		expect(form.blue).toBe(0);
		expect(form.easingId).toBe('easing0');
		expect(form.duration).toBe(0);
		expect(form.wait).toBe(false);
		wrapper.unmount();
	});

	it('edit 路径：handler.load 解构 params 到 form', async () => {
		const wrapper = mount(SetAmbientLight, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useSetAmbientLightCommandSchema();
		CommandSchema.edit(target, {
			id: 'setAmbientLight',
			params: { red: 255, green: 128, blue: 0, easingId: 'e2', duration: 400, wait: true }
		});
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('setAmbientLight');
		expect(form.red).toBe(255);
		expect(form.green).toBe(128);
		expect(form.blue).toBe(0);
		expect(form.easingId).toBe('e2');
		expect(form.duration).toBe(400);
		expect(form.wait).toBe(true);
		wrapper.unmount();
	});

	it('save 路径：用户改 form 后经 Command.cases.setAmbientLight.save 保存', async () => {
		const wrapper = mount(SetAmbientLight, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useSetAmbientLightCommandSchema();
		Command.cases.setAmbientLight.customLoad!({
			red: 0,
			green: 0,
			blue: 0,
			easingId: 'easing0',
			duration: 0,
			wait: false
		});
		form.red = 100;
		form.green = 200;
		form.blue = 50;
		form.duration = 300;
		form.wait = true;
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.setAmbientLight.save!();
		expect(saved).toHaveBeenCalledWith({
			red: 100,
			green: 200,
			blue: 50,
			easingId: 'easing0',
			duration: 300,
			wait: true
		});
		wrapper.unmount();
	});

	it('parse 路径：customParse 渲染 RGB/缓动文本', () => {
		const contents = Command.cases.setAmbientLight.parse!({
			red: 100,
			green: 200,
			blue: 50,
			easingId: 'easing0',
			duration: 300,
			wait: true
		});
		expect(contents[0]).toEqual({ color: 'scene' });
		expect(contents[1].text).toContain('command.setAmbientLight');
		expect(contents[2].text).toContain('RGB');
		expect(contents[2].text).toContain('[num:100]');
		expect(contents[2].text).toContain('[num:200]');
		expect(contents[2].text).toContain('[num:50]');
		expect(contents[2].text).toContain('[easing:easing0]');
	});
});
