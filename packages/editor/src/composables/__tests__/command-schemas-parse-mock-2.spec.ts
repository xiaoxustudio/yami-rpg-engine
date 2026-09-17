import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { markRaw } from 'vue';
import { mount } from '@vue/test-utils';
import {
	Command,
	initCommandColorBridges,
	initCommandParseBridges
} from '@app/commands/command-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { Window } from '@app/tools/window-object.ts';
import { Data } from '@app/data/data-object.ts';
import SetAmbientLight from '@app/components/commands/SetAmbientLight.vue';
import { useSetAmbientLightCommandSchema } from '@app/composables/commands/useSetAmbientLightCommandSchema';
import SetCursor from '@app/components/commands/SetCursor.vue';
import { useSetCursorCommandSchema } from '@app/composables/commands/useSetCursorCommandSchema';
import SetGameSpeed from '@app/components/commands/SetGameSpeed.vue';
import { useSetGameSpeedCommandSchema } from '@app/composables/commands/useSetGameSpeedCommandSchema';
import SetItem from '@app/components/commands/SetItem.vue';
import { useSetItemCommandSchema } from '@app/composables/commands/useSetItemCommandSchema';
import SetList from '@app/components/commands/SetList.vue';
import { VariableGetter } from '@app/commands/accessors/variable-accessor-window.ts';
import { useSetListCommandSchema } from '@app/composables/commands/useSetListCommandSchema';
import SetLoop from '@app/components/commands/SetLoop.vue';
import { useSetLoopCommandSchema } from '@app/composables/commands/useSetLoopCommandSchema';
import SetMovementSpeed from '@app/components/commands/SetMovementSpeed.vue';
import { useSetMovementSpeedCommandSchema } from '@app/composables/commands/useSetMovementSpeedCommandSchema';
import SetPartyMember from '@app/components/commands/SetPartyMember.vue';
import { useSetPartyMemberCommandSchema } from '@app/composables/commands/useSetPartyMemberCommandSchema';
import SetPlayerActor from '@app/components/commands/SetPlayerActor.vue';
import { useSetPlayerActorCommandSchema } from '@app/composables/commands/useSetPlayerActorCommandSchema';
import SetPointerEventRoot from '@app/components/commands/SetPointerEventRoot.vue';
import { useSetPointerEventRootCommandSchema } from '@app/composables/commands/useSetPointerEventRootCommandSchema';
import '@app/animation/register.ts';

vi.mock('@app/composables/useCommandParse.ts', () => ({
	parseVariable: (value: unknown) => `[var:${(value as { key?: string })?.key ?? ''}]`,
	parseGlobalVariable: (value: unknown) => `[gvar:${String(value)}]`,
	parseVariableNumber: (value: unknown, unit = '') => `[num:${String(value)}]${unit}`,
	parseVariableString: (value: unknown) => `[str:${String(value)}]`,
	parseVariableFile: (value: unknown) => `[file:${String(value)}]`,
	parseMultiLineString: (value: unknown) => String(value),
	parseActor: (value: unknown) =>
		`[actor:${String((value as { type?: string })?.type ?? value)}]`,
	parseEnumString: (value: unknown) => `[enum:${String(value)}]`,
	parseFileName: (value: unknown) => `[file:${String(value)}]`,
	parseAudioType: (value: unknown) => `[audio:${String(value)}]`,
	parseWait: (value: unknown) => (value ? '[wait]' : ''),
	parseEasing: (value: unknown) => `[easing:${String(value)}]`,
	parsePosition: (value: unknown) => `[pos:${(value as { type?: string })?.type}]`,
	parseElement: (value: unknown) =>
		`[element:${String((value as { type?: string })?.type ?? value)}]`,
	parseItem: (value: unknown) => `[item:${String((value as { type?: string })?.type ?? value)}]`,
	parseHexColor: (value: unknown) => `[hex:${String(value)}]`,
	parseAttributeGroup: (value: unknown) => `[attrGroup:${String(value)}]`,
	parseEnumGroup: (value: unknown) => `[enumGroup:${String(value)}]`,
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

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ syncState: vi.fn() })
}));

{
	initCommandColorBridges();
	initCommandParseBridges();

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
}
{
	initCommandColorBridges();
	initCommandParseBridges();

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
}
{
	initCommandColorBridges();
	initCommandParseBridges();

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
}
{
	initCommandColorBridges();
	initCommandParseBridges();

	const target = {
		scrollAndResize: vi.fn(),
		getSelectionPosition: () => ({ x: 100, y: 100 }),
		save: vi.fn()
	};

	describe('useSetItemCommandSchema（setItem 命令表单 composable：insert/edit/save/parse 路径）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			Command.words = markRaw(new Command.WordList());
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		it('insert 路径：打开窗口并 load 默认 form', async () => {
			const wrapper = mount(SetItem, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useSetItemCommandSchema();
			CommandSchema.insert(target, 'setItem');
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('setItem');
			expect(form.item).toEqual({ type: 'trigger' });
			expect(form.operation).toBe('increase');
			expect(form.quantity).toBe(1);
			wrapper.unmount();
		});

		it('edit 路径：handler.load 解构 params 到 form', async () => {
			const wrapper = mount(SetItem, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useSetItemCommandSchema();
			CommandSchema.edit(target, {
				id: 'setItem',
				params: { item: { type: 'latest' }, operation: 'decrease', quantity: 5 }
			});
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('setItem');
			expect(form.item).toEqual({ type: 'latest' });
			expect(form.operation).toBe('decrease');
			expect(form.quantity).toBe(5);
			wrapper.unmount();
		});

		it('save 路径：用户改 form 后经 Command.cases.setItem.save 保存', async () => {
			const wrapper = mount(SetItem, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useSetItemCommandSchema();
			Command.cases.setItem.customLoad!({
				item: { type: 'trigger' },
				operation: 'increase',
				quantity: 1
			});
			form.operation = 'decrease';
			form.quantity = 3;
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.setItem.save!();
			expect(saved).toHaveBeenCalledWith({
				item: { type: 'trigger' },
				operation: 'decrease',
				quantity: 3
			});
			wrapper.unmount();
		});

		it('parse 路径：customParse 渲染 item/operation/quantity 文本', () => {
			const contents = Command.cases.setItem.parse!({
				item: { type: 'trigger' },
				operation: 'increase',
				quantity: 2
			});
			expect(contents[0]).toEqual({ color: 'inventory' });
			expect(contents[1].text).toContain('command.setItem');
			expect(contents[2].text).toContain('[item:trigger]');
			expect(contents[2].text).toContain('command.setItem.increase');
			expect(contents[2].text).toContain('[num:2]');
		});
	});
}
{
	initCommandColorBridges();
	initCommandParseBridges();

	const target = {
		scrollAndResize: vi.fn(),
		getSelectionPosition: () => ({ x: 100, y: 100 }),
		save: vi.fn()
	};

	describe('useSetListCommandSchema（setList 命令表单 composable：insert/edit/save/parse 路径）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			Command.words = markRaw(new Command.WordList());
			VariableGetter.isNone = (variable: unknown) =>
				!variable || (variable as { key?: string })?.key === '';
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		it('insert 路径：打开窗口并 load 默认 form', async () => {
			const wrapper = mount(SetList, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useSetListCommandSchema();
			CommandSchema.insert(target, 'setList');
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('setList');
			expect(form.variable).toEqual({ type: 'local', key: '' });
			expect(form.operation).toBe('set-empty');
			expect(form.indexSkipCheck).toBe(true);
			wrapper.unmount();
		});

		it('edit 路径：customLoad 解构 params（list→numbers）到 form', async () => {
			const wrapper = mount(SetList, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useSetListCommandSchema();
			CommandSchema.edit(target, {
				id: 'setList',
				params: {
					variable: { type: 'local', key: 'foo' },
					operation: 'set-numbers',
					list: [1, 2, 3]
				}
			});
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('setList');
			expect(form.variable).toEqual({ type: 'local', key: 'foo' });
			expect(form.operation).toBe('set-numbers');
			expect(form.numbers).toEqual([1, 2, 3]);
			wrapper.unmount();
		});

		it('save 路径：variable 无效校验失败不保存', async () => {
			const wrapper = mount(SetList, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.setList.customLoad!({
				variable: { type: 'none', key: '' },
				operation: 'set-empty'
			});
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.setList.save!();
			expect(saved).not.toHaveBeenCalled();
			wrapper.unmount();
		});

		it('save 路径：operation=set-empty 时保存 variable/operation', async () => {
			const wrapper = mount(SetList, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.setList.customLoad!({
				variable: { type: 'local', key: 'foo' },
				operation: 'set-empty'
			});
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.setList.save!();
			expect(saved).toHaveBeenCalledWith({
				variable: { type: 'local', key: 'foo' },
				operation: 'set-empty'
			});
			wrapper.unmount();
		});

		it('save 路径：operation=set-numbers 且 list 为空校验失败不保存', async () => {
			const wrapper = mount(SetList, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.setList.customLoad!({
				variable: { type: 'local', key: 'foo' },
				operation: 'set-numbers',
				list: []
			});
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.setList.save!();
			expect(saved).not.toHaveBeenCalled();
			wrapper.unmount();
		});

		it('save 路径：operation=set-numbers 时保存 list', async () => {
			const wrapper = mount(SetList, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.setList.customLoad!({
				variable: { type: 'local', key: 'foo' },
				operation: 'set-numbers',
				list: [1, 2]
			});
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.setList.save!();
			expect(saved).toHaveBeenCalledWith({
				variable: { type: 'local', key: 'foo' },
				operation: 'set-numbers',
				list: [1, 2]
			});
			wrapper.unmount();
		});

		it('save 路径：operation=set-boolean 时保存 index/constant/skipCheck', async () => {
			const wrapper = mount(SetList, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.setList.customLoad!({
				variable: { type: 'local', key: 'foo' },
				operation: 'set-boolean',
				index: 2,
				constant: true,
				skipCheck: false
			});
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.setList.save!();
			expect(saved).toHaveBeenCalledWith({
				variable: { type: 'local', key: 'foo' },
				operation: 'set-boolean',
				index: 2,
				constant: true,
				skipCheck: false
			});
			wrapper.unmount();
		});

		it('save 路径：operation=push 时保存 operand', async () => {
			const wrapper = mount(SetList, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.setList.customLoad!({
				variable: { type: 'local', key: 'foo' },
				operation: 'push',
				operand: { type: 'local', key: 'bar' }
			});
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.setList.save!();
			expect(saved).toHaveBeenCalledWith({
				variable: { type: 'local', key: 'foo' },
				operation: 'push',
				operand: { type: 'local', key: 'bar' }
			});
			wrapper.unmount();
		});

		it('save 路径：operation=set-variable 且 operand 无效校验失败不保存', async () => {
			const wrapper = mount(SetList, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.setList.customLoad!({
				variable: { type: 'local', key: 'foo' },
				operation: 'set-variable',
				index: 0,
				operand: { type: 'local', key: '' }
			});
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.setList.save!();
			expect(saved).not.toHaveBeenCalled();
			wrapper.unmount();
		});

		it('parse 路径：operation=set-empty 渲染变量列表文本', () => {
			const contents = Command.cases.setList.parse!({
				variable: { type: 'local', key: 'foo' },
				operation: 'set-empty'
			});
			expect(contents[0]).toEqual({ color: 'variable' });
			expect(contents[1].text).toContain('command.setList.alias');
			expect(contents[3].text).toContain('[var:foo]');
		});

		it('parse 路径：operation=set-boolean 渲染常量与 skipCheck 文本', () => {
			const contents = Command.cases.setList.parse!({
				variable: { type: 'local', key: 'foo' },
				operation: 'set-boolean',
				index: 2,
				constant: true,
				skipCheck: true
			});
			expect(contents[0]).toEqual({ color: 'variable' });
			expect(contents[3].text).toContain('[var:foo]');
			expect(contents[3].text).toContain('command.setList.skipCheck');
		});
	});
}
{
	initCommandColorBridges();
	initCommandParseBridges();

	const target = {
		scrollAndResize: vi.fn(),
		getSelectionPosition: () => ({ x: 100, y: 100 }),
		save: vi.fn()
	};

	describe('useSetLoopCommandSchema（setLoop 命令表单 composable：insert/edit/save/parse 路径）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			Command.words = markRaw(new Command.WordList());
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		it('insert 路径：打开窗口并 load 默认 form', async () => {
			const wrapper = mount(SetLoop, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useSetLoopCommandSchema();
			CommandSchema.insert(target, 'setLoop');
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('setLoop');
			expect(form.type).toBe('bgm');
			expect(form.loop).toBe(false);
			wrapper.unmount();
		});

		it('edit 路径：handler.load 解构 params 到 form', async () => {
			const wrapper = mount(SetLoop, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useSetLoopCommandSchema();
			CommandSchema.edit(target, { id: 'setLoop', params: { type: 'bgs', loop: true } });
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('setLoop');
			expect(form.type).toBe('bgs');
			expect(form.loop).toBe(true);
			wrapper.unmount();
		});

		it('save 路径：用户改 form 后经 Command.cases.setLoop.save 保存', async () => {
			const wrapper = mount(SetLoop, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useSetLoopCommandSchema();
			Command.cases.setLoop.customLoad!({ type: 'bgm', loop: false });
			form.type = 'cv';
			form.loop = true;
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.setLoop.save!();
			expect(saved).toHaveBeenCalledWith({ type: 'cv', loop: true });
			wrapper.unmount();
		});

		it('parse 路径：customParse 渲染 type/loop 文本', () => {
			const contents = Command.cases.setLoop.parse!({ type: 'bgm', loop: true });
			expect(contents[0]).toEqual({ color: 'audio' });
			expect(contents[1].text).toContain('command.setLoop');
			expect(contents[2].text).toContain('[audio:bgm]');
			expect(contents[2].text).toContain('command.setLoop.loop');
		});
	});
}
{
	initCommandColorBridges();
	initCommandParseBridges();

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
			const { form } = useSetMovementSpeedCommandSchema();
			Command.cases.setMovementSpeed.customLoad!({
				actor: { type: 'trigger' },
				property: 'base',
				base: 0,
				factor: 0
			});
			form.property = 'factor';
			form.factor = 2.5;
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
}
{
	initCommandColorBridges();
	initCommandParseBridges();

	const target = {
		scrollAndResize: vi.fn(),
		getSelectionPosition: () => ({ x: 100, y: 100 }),
		save: vi.fn()
	};

	describe('useSetPartyMemberCommandSchema（setPartyMember 命令表单 composable：insert/edit/save/parse 路径）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			Command.words = markRaw(new Command.WordList());
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		it('insert 路径：打开窗口并 load 默认 form', async () => {
			const wrapper = mount(SetPartyMember, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useSetPartyMemberCommandSchema();
			CommandSchema.insert(target, 'setPartyMember');
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('setPartyMember');
			expect(form.operation).toBe('add');
			expect(form.actor).toEqual({ type: 'trigger' });
			wrapper.unmount();
		});

		it('edit 路径：handler.load 解构 params 到 form', async () => {
			const wrapper = mount(SetPartyMember, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useSetPartyMemberCommandSchema();
			CommandSchema.edit(target, {
				id: 'setPartyMember',
				params: { operation: 'remove', actor: { type: 'latest' } }
			});
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('setPartyMember');
			expect(form.operation).toBe('remove');
			expect(form.actor).toEqual({ type: 'latest' });
			wrapper.unmount();
		});

		it('save 路径：用户改 form 后经 Command.cases.setPartyMember.save 保存', async () => {
			const wrapper = mount(SetPartyMember, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useSetPartyMemberCommandSchema();
			Command.cases.setPartyMember.customLoad!({
				operation: 'add',
				actor: { type: 'trigger' }
			});
			form.operation = 'remove';
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.setPartyMember.save!();
			expect(saved).toHaveBeenCalledWith({ operation: 'remove', actor: { type: 'trigger' } });
			wrapper.unmount();
		});

		it('parse 路径：customParse 渲染 operation/actor 文本', () => {
			const contents = Command.cases.setPartyMember.parse!({
				operation: 'add',
				actor: { type: 'trigger' }
			});
			expect(contents[0]).toEqual({ color: 'actor' });
			expect(contents[1].text).toContain('command.setPartyMember');
			expect(contents[2].text).toContain('command.setPartyMember.add');
			expect(contents[2].text).toContain('[actor:trigger]');
		});
	});
}
{
	initCommandColorBridges();
	initCommandParseBridges();

	const target = {
		scrollAndResize: vi.fn(),
		getSelectionPosition: () => ({ x: 100, y: 100 }),
		save: vi.fn()
	};

	describe('useSetPlayerActorCommandSchema（setPlayerActor 命令表单 composable：insert/edit/save/parse 路径）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			Command.words = markRaw(new Command.WordList());
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		it('insert 路径：打开窗口并 load 默认 form', async () => {
			const wrapper = mount(SetPlayerActor, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useSetPlayerActorCommandSchema();
			CommandSchema.insert(target, 'setPlayerActor');
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('setPlayerActor');
			expect(form.actor).toEqual({ type: 'trigger' });
			wrapper.unmount();
		});

		it('edit 路径：handler.load 解构 params 到 form', async () => {
			const wrapper = mount(SetPlayerActor, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useSetPlayerActorCommandSchema();
			CommandSchema.edit(target, {
				id: 'setPlayerActor',
				params: { actor: { type: 'latest' } }
			});
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('setPlayerActor');
			expect(form.actor).toEqual({ type: 'latest' });
			wrapper.unmount();
		});

		it('save 路径：用户改 form 后经 Command.cases.setPlayerActor.save 保存', async () => {
			const wrapper = mount(SetPlayerActor, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useSetPlayerActorCommandSchema();
			Command.cases.setPlayerActor.customLoad!({ actor: { type: 'trigger' } });
			form.actor = { type: 'self' };
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.setPlayerActor.save!();
			expect(saved).toHaveBeenCalledWith({ actor: { type: 'self' } });
			wrapper.unmount();
		});

		it('parse 路径：customParse 渲染 actor 文本', () => {
			const contents = Command.cases.setPlayerActor.parse!({ actor: { type: 'trigger' } });
			expect(contents[0]).toEqual({ color: 'actor' });
			expect(contents[1].text).toContain('command.setPlayerActor');
			expect(contents[2].text).toContain('[actor:trigger]');
		});
	});
}
{
	initCommandColorBridges();
	initCommandParseBridges();

	interface ControlEl extends HTMLElement {
		read(): unknown;
		write(value: unknown): void;
		input(value: unknown): void;
	}

	const getControl = (id: string): ControlEl =>
		document.getElementById(id) as unknown as ControlEl;

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
			getControl('setPointerEventRoot-operation').input('remove-latest');
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
}
