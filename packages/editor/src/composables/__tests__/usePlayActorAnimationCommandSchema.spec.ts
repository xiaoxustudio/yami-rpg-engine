import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { markRaw } from 'vue';
import { mount } from '@vue/test-utils';
import PlayActorAnimation from '@app/components/commands/PlayActorAnimation.vue';
import {
	Command,
	initCommandColorBridges,
	initCommandParseBridges
} from '@app/commands/command-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { usePlayActorAnimationCommandSchema } from '@app/composables/commands/usePlayActorAnimationCommandSchema';
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

describe('usePlayActorAnimationCommandSchema（playActorAnimation 命令表单 composable：insert/edit/save/parse 路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Command.words = markRaw(new Command.WordList());
		Data.enumeration = { context: { getString: () => undefined } } as never;
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('insert 路径：打开窗口并 load 默认 form', async () => {
		const wrapper = mount(PlayActorAnimation, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = usePlayActorAnimationCommandSchema();
		CommandSchema.insert(target, 'playActorAnimation');
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('playActorAnimation');
		expect(form.actor).toEqual({ type: 'trigger' });
		expect(form.motion).toBe('');
		expect(form.speed).toBe(1);
		expect(form.wait).toBe(false);
		wrapper.unmount();
	});

	it('edit 路径：handler.load 解构 params 到 form', async () => {
		const wrapper = mount(PlayActorAnimation, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = usePlayActorAnimationCommandSchema();
		CommandSchema.edit(target, {
			id: 'playActorAnimation',
			params: { actor: { type: 'latest' }, motion: 'run', speed: 2, wait: true }
		});
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('playActorAnimation');
		expect(form.actor).toEqual({ type: 'latest' });
		expect(form.motion).toBe('run');
		expect(form.speed).toBe(2);
		expect(form.wait).toBe(true);
		wrapper.unmount();
	});

	it('save 路径：motion 为空时校验失败不保存', async () => {
		const wrapper = mount(PlayActorAnimation, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.playActorAnimation.customLoad!({
			actor: { type: 'trigger' },
			motion: '',
			speed: 1,
			wait: false
		});
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.playActorAnimation.save!();
		expect(saved).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('save 路径：用户改 form 后经 Command.cases.playActorAnimation.save 保存', async () => {
		const wrapper = mount(PlayActorAnimation, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = usePlayActorAnimationCommandSchema();
		Command.cases.playActorAnimation.customLoad!({
			actor: { type: 'trigger' },
			motion: 'run',
			speed: 1,
			wait: false
		});
		form.motion = 'jump';
		form.speed = 2.5;
		form.wait = true;
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.playActorAnimation.save!();
		expect(saved).toHaveBeenCalledWith({
			actor: { type: 'trigger' },
			motion: 'jump',
			speed: 2.5,
			wait: true
		});
		wrapper.unmount();
	});

	it('parse 路径：customParse 渲染 actor/motion/speed/wait 文本', () => {
		const contents = Command.cases.playActorAnimation.parse!({
			actor: { type: 'trigger' },
			motion: 'run',
			speed: 1,
			wait: true
		});
		expect(contents[0]).toEqual({ color: 'actor' });
		expect(contents[1].text).toContain('command.playActorAnimation');
		expect(contents[2].text).toContain('[actor:trigger]');
		expect(contents[2].text).toContain('[enum:run]');
		expect(contents[2].text).toContain('[wait]');
	});
});
