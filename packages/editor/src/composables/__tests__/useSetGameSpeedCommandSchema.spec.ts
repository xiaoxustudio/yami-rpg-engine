import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { markRaw } from 'vue';
import { mount } from '@vue/test-utils';
import SetGameSpeed from '@app/components/commands/SetGameSpeed.vue';
import {
	Command,
	initCommandColorBridges,
	initCommandParseBridges
} from '@app/commands/command-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { useSetGameSpeedCommandSchema } from '@app/composables/commands/useSetGameSpeedCommandSchema';
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

describe('useSetGameSpeedCommandSchema（setGameSpeed 命令表单 composable：insert/edit/save/parse 路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Command.words = markRaw(new Command.WordList());
		Data.easings = [{ id: 'easing0', name: 'Linear' }] as never;
		Data.createEasingItems = vi.fn(() => [{ name: 'Linear', value: 'easing0' }]) as never;
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('insert 路径：打开窗口并 load 默认 form', async () => {
		const wrapper = mount(SetGameSpeed, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useSetGameSpeedCommandSchema();
		CommandSchema.insert(target, 'setGameSpeed');
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('setGameSpeed');
		expect(form.speed).toBe(1);
		expect(form.easingId).toBe('easing0');
		expect(form.duration).toBe(0);
		expect(form.wait).toBe(false);
		wrapper.unmount();
	});

	it('edit 路径：handler.load 解构 params 到 form', async () => {
		const wrapper = mount(SetGameSpeed, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useSetGameSpeedCommandSchema();
		CommandSchema.edit(target, {
			id: 'setGameSpeed',
			params: { speed: 2, easingId: 'e2', duration: 500, wait: true }
		});
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('setGameSpeed');
		expect(form.speed).toBe(2);
		expect(form.easingId).toBe('e2');
		expect(form.duration).toBe(500);
		expect(form.wait).toBe(true);
		wrapper.unmount();
	});

	it('save 路径：用户改 form 后经 Command.cases.setGameSpeed.save 保存', async () => {
		const wrapper = mount(SetGameSpeed, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useSetGameSpeedCommandSchema();
		Command.cases.setGameSpeed.customLoad!({
			speed: 1,
			easingId: 'easing0',
			duration: 0,
			wait: false
		});
		form.speed = 3;
		form.duration = 800;
		form.wait = true;
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.setGameSpeed.save!();
		expect(saved).toHaveBeenCalledWith({
			speed: 3,
			easingId: 'easing0',
			duration: 800,
			wait: true
		});
		wrapper.unmount();
	});

	it('parse 路径：customParse 渲染 speed/缓动文本', () => {
		const contents = Command.cases.setGameSpeed.parse!({
			speed: 2,
			easingId: 'easing0',
			duration: 500,
			wait: true
		});
		expect(contents[0]).toEqual({ color: 'system' });
		expect(contents[1].text).toContain('command.setGameSpeed');
		expect(contents[2].text).toContain('[num:2]');
		expect(contents[2].text).toContain('[easing:easing0]');
	});
});
