import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { markRaw } from 'vue';
import { mount } from '@vue/test-utils';
import PlayAnimation from '@app/components/commands/PlayAnimation.vue';
import {
	Command,
	initCommandColorBridges,
	initCommandParseBridges
} from '@app/commands/command-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { usePlayAnimationCommandSchema } from '@app/composables/commands/usePlayAnimationCommandSchema';
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

describe('usePlayAnimationCommandSchema（playAnimation 命令表单 composable：insert/edit/save/parse 路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Command.words = markRaw(new Command.WordList());
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('insert 路径：打开窗口并 load 默认 form', async () => {
		const wrapper = mount(PlayAnimation, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = usePlayAnimationCommandSchema();
		CommandSchema.insert(target, 'playAnimation');
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('playAnimation');
		expect(form.mode).toBe('position');
		expect(form.animationId).toBe('');
		expect(form.motion).toBe('');
		expect(form.speed).toBe(1);
		wrapper.unmount();
	});

	it('edit 路径：handler.load 解构 params 到 form', async () => {
		const wrapper = mount(PlayAnimation, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = usePlayAnimationCommandSchema();
		CommandSchema.edit(target, {
			id: 'playAnimation',
			params: {
				mode: 'position',
				position: { type: 'absolute', x: 10, y: 20 },
				animationId: 'anim1',
				motion: 'm1',
				rotatable: true,
				priority: 3,
				offsetY: 0,
				angle: 0,
				speed: 1,
				wait: false
			}
		});
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('playAnimation');
		expect(form.animationId).toBe('anim1');
		expect(form.motion).toBe('m1');
		expect(form.rotatable).toBe(true);
		expect(form.priority).toBe(3);
		wrapper.unmount();
	});

	it('save 路径：animationId 为空时校验失败不保存', async () => {
		const wrapper = mount(PlayAnimation, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.playAnimation.customLoad!({
			mode: 'position',
			position: { type: 'actor', actor: { type: 'trigger' } },
			animationId: '',
			motion: 'm1',
			rotatable: false,
			priority: 0,
			offsetY: 0,
			angle: 0,
			speed: 1,
			wait: false
		});
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.playAnimation.save!();
		expect(saved).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('save 路径：motion 为空时校验失败不保存', async () => {
		const wrapper = mount(PlayAnimation, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.playAnimation.customLoad!({
			mode: 'position',
			position: { type: 'actor', actor: { type: 'trigger' } },
			animationId: 'anim1',
			motion: '',
			rotatable: false,
			priority: 0,
			offsetY: 0,
			angle: 0,
			speed: 1,
			wait: false
		});
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.playAnimation.save!();
		expect(saved).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('save 路径：mode=position 时保存 position 分支', async () => {
		const wrapper = mount(PlayAnimation, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.playAnimation.customLoad!({
			mode: 'position',
			position: { type: 'absolute', x: 10, y: 20 },
			animationId: 'anim1',
			motion: 'm1',
			rotatable: true,
			priority: 3,
			offsetY: 4,
			angle: 45,
			speed: 2,
			wait: true
		});
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.playAnimation.save!();
		expect(saved).toHaveBeenCalledWith({
			mode: 'position',
			position: { type: 'absolute', x: 10, y: 20 },
			animationId: 'anim1',
			motion: 'm1',
			rotatable: true,
			priority: 3,
			offsetY: 4,
			angle: 45,
			speed: 2,
			wait: true
		});
		wrapper.unmount();
	});

	it('save 路径：mode=actor 时保存 actor 分支', async () => {
		const wrapper = mount(PlayAnimation, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.playAnimation.customLoad!({
			mode: 'position',
			position: { type: 'actor', actor: { type: 'trigger' } },
			actor: { type: 'trigger' },
			animationId: 'anim1',
			motion: 'm1',
			rotatable: false,
			priority: 0,
			offsetY: 0,
			angle: 0,
			speed: 1,
			wait: false
		});
		getControl('playAnimation-mode').write('actor');
		getControl('playAnimation-actor').write({ type: 'latest' });
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.playAnimation.save!();
		expect(saved).toHaveBeenCalledWith({
			mode: 'actor',
			actor: { type: 'latest' },
			animationId: 'anim1',
			motion: 'm1',
			rotatable: false,
			priority: 0,
			offsetY: 0,
			angle: 0,
			speed: 1,
			wait: false
		});
		wrapper.unmount();
	});

	it('parse 路径：mode=position 渲染 position 文本', () => {
		const contents = Command.cases.playAnimation.parse!({
			mode: 'position',
			position: { type: 'absolute', x: 10, y: 20 },
			animationId: 'anim1',
			motion: 'm1',
			rotatable: false,
			priority: 0,
			offsetY: 0,
			angle: 0,
			speed: 1,
			wait: false
		});
		expect(contents[0]).toEqual({ color: 'object' });
		expect(contents[1].text).toContain('command.playAnimation');
		expect(contents[2].text).toContain('[pos:absolute]');
		expect(contents[2].text).toContain('[file:anim1]');
	});

	it('parse 路径：mode=actor 渲染 actor 文本', () => {
		const contents = Command.cases.playAnimation.parse!({
			mode: 'actor',
			actor: { type: 'latest' },
			animationId: 'anim1',
			motion: 'm1',
			rotatable: false,
			priority: 0,
			offsetY: 0,
			angle: 0,
			speed: 1,
			wait: false
		});
		expect(contents[0]).toEqual({ color: 'object' });
		expect(contents[2].text).toContain('command.playAnimation.bind');
		expect(contents[2].text).toContain('[actor:latest]');
		expect(contents[2].text).toContain('[num:0]°');
	});
});
