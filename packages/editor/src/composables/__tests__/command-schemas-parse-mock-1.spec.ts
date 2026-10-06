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
import NestElement from '@app/components/commands/NestElement.vue';
import { useNestElementCommandSchema } from '@app/composables/commands/useNestElementCommandSchema';
import PlayActorAnimation from '@app/components/commands/PlayActorAnimation.vue';
import { usePlayActorAnimationCommandSchema } from '@app/composables/commands/usePlayActorAnimationCommandSchema';
import { Data } from '@app/data/data-object.ts';
import PlayAnimation from '@app/components/commands/PlayAnimation.vue';
import { usePlayAnimationCommandSchema } from '@app/composables/commands/usePlayAnimationCommandSchema';
import RemoveAnimationComponent from '@app/components/commands/RemoveAnimationComponent.vue';
import { useRemoveAnimationComponentCommandSchema } from '@app/composables/commands/useRemoveAnimationComponentCommandSchema';
import RemoveTarget from '@app/components/commands/RemoveTarget.vue';
import { useRemoveTargetCommandSchema } from '@app/composables/commands/useRemoveTargetCommandSchema';
import RenderOutline from '@app/components/commands/RenderOutline.vue';
import { useRenderOutlineCommandSchema } from '@app/composables/commands/useRenderOutlineCommandSchema';
import ResetTargets from '@app/components/commands/ResetTargets.vue';
import { useResetTargetsCommandSchema } from '@app/composables/commands/useResetTargetsCommandSchema';
import RestoreAudio from '@app/components/commands/RestoreAudio.vue';
import { useRestoreAudioCommandSchema } from '@app/composables/commands/useRestoreAudioCommandSchema';
import SaveAudio from '@app/components/commands/SaveAudio.vue';
import { useSaveAudioCommandSchema } from '@app/composables/commands/useSaveAudioCommandSchema';
import SetActive from '@app/components/commands/SetActive.vue';
import { useSetActiveCommandSchema } from '@app/composables/commands/useSetActiveCommandSchema';
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
	useLocalStore: () => ({ syncState: vi.fn() }),
	getLocalStore: () => ({ syncState: vi.fn() })
}));

{
	initCommandColorBridges();
	initCommandParseBridges();

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
}
{
	initCommandColorBridges();
	initCommandParseBridges();

	const target = {
		scrollAndResize: vi.fn(),
		getSelectionPosition: () => ({ x: 100, y: 100 }),
		save: vi.fn()
	};

	describe('useNestElementCommandSchema（nestElement 命令表单 composable：insert/edit/save/parse 路径）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			Command.words = markRaw(new Command.WordList());
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		it('insert 路径：打开窗口并 load 默认 form', async () => {
			const wrapper = mount(NestElement, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useNestElementCommandSchema();
			CommandSchema.insert(target, 'nestElement');
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('nestElement');
			expect(form.parent).toEqual({ type: 'trigger' });
			expect(form.child).toEqual({ type: 'latest' });
			wrapper.unmount();
		});

		it('edit 路径：handler.load 解构 params 到 form', async () => {
			const wrapper = mount(NestElement, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useNestElementCommandSchema();
			CommandSchema.edit(target, {
				id: 'nestElement',
				params: { parent: { type: 'self' }, child: { type: 'global' } }
			});
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('nestElement');
			expect(form.parent).toEqual({ type: 'self' });
			expect(form.child).toEqual({ type: 'global' });
			wrapper.unmount();
		});

		it('save 路径：用户改 form 后经 Command.cases.nestElement.save 保存', async () => {
			const wrapper = mount(NestElement, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useNestElementCommandSchema();
			Command.cases.nestElement.customLoad!({
				parent: { type: 'trigger' },
				child: { type: 'latest' }
			});
			form.parent = { type: 'self' };
			form.child = { type: 'global' };
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.nestElement.save!();
			expect(saved).toHaveBeenCalledWith({
				parent: { type: 'self' },
				child: { type: 'global' }
			});
			wrapper.unmount();
		});

		it('parse 路径：customParse 渲染 parent/child 文本', () => {
			const contents = Command.cases.nestElement.parse!({
				parent: { type: 'trigger' },
				child: { type: 'latest' }
			});
			expect(contents[0]).toEqual({ color: 'element' });
			expect(contents[1].text).toContain('command.nestElement');
			expect(contents[2].text).toContain('[element:trigger]');
			expect(contents[2].text).toContain('[element:latest]');
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
			getControl('playAnimation-mode').input('actor');
			getControl('playAnimation-actor').input({ type: 'latest' });
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
}
{
	initCommandColorBridges();
	initCommandParseBridges();

	const target = {
		scrollAndResize: vi.fn(),
		getSelectionPosition: () => ({ x: 100, y: 100 }),
		save: vi.fn()
	};

	describe('useRemoveAnimationComponentCommandSchema（removeAnimationComponent 命令表单 composable：insert/edit/save/parse 路径）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			Command.words = markRaw(new Command.WordList());
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		it('insert 路径：打开窗口并 load 默认 form', async () => {
			const wrapper = mount(RemoveAnimationComponent, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useRemoveAnimationComponentCommandSchema();
			CommandSchema.insert(target, 'removeAnimationComponent');
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('removeAnimationComponent');
			expect(form.actor).toEqual({ type: 'trigger' });
			expect(form.animationId).toBe('');
			expect(form.motion).toBe('');
			wrapper.unmount();
		});

		it('edit 路径：handler.load 解构 params 到 form', async () => {
			const wrapper = mount(RemoveAnimationComponent, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useRemoveAnimationComponentCommandSchema();
			CommandSchema.edit(target, {
				id: 'removeAnimationComponent',
				params: { actor: { type: 'latest' }, animationId: 'a1', motion: 'm1' }
			});
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('removeAnimationComponent');
			expect(form.actor).toEqual({ type: 'latest' });
			expect(form.animationId).toBe('a1');
			expect(form.motion).toBe('m1');
			wrapper.unmount();
		});

		it('save 路径：animationId 为空时校验失败不保存', async () => {
			const wrapper = mount(RemoveAnimationComponent, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.removeAnimationComponent.customLoad!({
				actor: { type: 'trigger' },
				animationId: '',
				motion: 'm1'
			});
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.removeAnimationComponent.save!();
			expect(saved).not.toHaveBeenCalled();
			wrapper.unmount();
		});

		it('save 路径：motion 为空时校验失败不保存', async () => {
			const wrapper = mount(RemoveAnimationComponent, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.removeAnimationComponent.customLoad!({
				actor: { type: 'trigger' },
				animationId: 'a1',
				motion: ''
			});
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.removeAnimationComponent.save!();
			expect(saved).not.toHaveBeenCalled();
			wrapper.unmount();
		});

		it('save 路径：用户改 form 后经 Command.cases.removeAnimationComponent.save 保存', async () => {
			const wrapper = mount(RemoveAnimationComponent, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useRemoveAnimationComponentCommandSchema();
			Command.cases.removeAnimationComponent.customLoad!({
				actor: { type: 'trigger' },
				animationId: 'a1',
				motion: 'm1'
			});
			form.actor = { type: 'latest' };
			form.motion = 'm2';
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.removeAnimationComponent.save!();
			expect(saved).toHaveBeenCalledWith({
				actor: { type: 'latest' },
				animationId: 'a1',
				motion: 'm2'
			});
			wrapper.unmount();
		});

		it('parse 路径：customParse 渲染 actor/animationId/motion 文本', () => {
			const contents = Command.cases.removeAnimationComponent.parse!({
				actor: { type: 'trigger' },
				animationId: 'a1',
				motion: 'm1'
			});
			expect(contents[0]).toEqual({ color: 'actor' });
			expect(contents[1].text).toContain('command.removeAnimationComponent');
			expect(contents[2].text).toContain('[actor:trigger]');
			expect(contents[2].text).toContain('[file:a1]');
			expect(contents[2].text).toContain('[enum:m1]');
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

	describe('useRemoveTargetCommandSchema（removeTarget 命令表单 composable：insert/edit/save/parse 路径）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			Command.words = markRaw(new Command.WordList());
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		it('insert 路径：打开窗口并 load 默认 form', async () => {
			const wrapper = mount(RemoveTarget, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useRemoveTargetCommandSchema();
			CommandSchema.insert(target, 'removeTarget');
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('removeTarget');
			expect(form.actor).toEqual({ type: 'trigger' });
			expect(form.target).toEqual({ type: 'trigger' });
			wrapper.unmount();
		});

		it('edit 路径：handler.load 解构 params 到 form', async () => {
			const wrapper = mount(RemoveTarget, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useRemoveTargetCommandSchema();
			CommandSchema.edit(target, {
				id: 'removeTarget',
				params: { actor: { type: 'latest' }, target: { type: 'self' } }
			});
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('removeTarget');
			expect(form.actor).toEqual({ type: 'latest' });
			expect(form.target).toEqual({ type: 'self' });
			wrapper.unmount();
		});

		it('save 路径：用户改 form 后经 Command.cases.removeTarget.save 保存', async () => {
			const wrapper = mount(RemoveTarget, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useRemoveTargetCommandSchema();
			Command.cases.removeTarget.customLoad!({
				actor: { type: 'trigger' },
				target: { type: 'trigger' }
			});
			form.actor = { type: 'latest' };
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.removeTarget.save!();
			expect(saved).toHaveBeenCalledWith({
				actor: { type: 'latest' },
				target: { type: 'trigger' }
			});
			wrapper.unmount();
		});

		it('parse 路径：customParse 渲染 actor/target 文本', () => {
			const contents = Command.cases.removeTarget.parse!({
				actor: { type: 'trigger' },
				target: { type: 'latest' }
			});
			expect(contents[0]).toEqual({ color: 'actor' });
			expect(contents[1].text).toContain('command.removeTarget');
			expect(contents[2].text).toContain('[actor:trigger]');
			expect(contents[2].text).toContain('[actor:latest]');
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
			getControl('renderOutline-operation').input('remove');
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
			getControl('renderOutline-operation').input('reset');
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
}
{
	initCommandColorBridges();
	initCommandParseBridges();

	const target = {
		scrollAndResize: vi.fn(),
		getSelectionPosition: () => ({ x: 100, y: 100 }),
		save: vi.fn()
	};

	describe('useResetTargetsCommandSchema（resetTargets 命令表单 composable：insert/edit/save/parse 路径）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			Command.words = markRaw(new Command.WordList());
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		it('insert 路径：打开窗口并 load 默认 form', async () => {
			const wrapper = mount(ResetTargets, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useResetTargetsCommandSchema();
			CommandSchema.insert(target, 'resetTargets');
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('resetTargets');
			expect(form.actor).toEqual({ type: 'trigger' });
			wrapper.unmount();
		});

		it('edit 路径：handler.load 解构 params 到 form', async () => {
			const wrapper = mount(ResetTargets, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useResetTargetsCommandSchema();
			CommandSchema.edit(target, {
				id: 'resetTargets',
				params: { actor: { type: 'latest' } }
			});
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('resetTargets');
			expect(form.actor).toEqual({ type: 'latest' });
			wrapper.unmount();
		});

		it('save 路径：用户改 form 后经 Command.cases.resetTargets.save 保存', async () => {
			const wrapper = mount(ResetTargets, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useResetTargetsCommandSchema();
			Command.cases.resetTargets.customLoad!({ actor: { type: 'trigger' } });
			form.actor = { type: 'self' };
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.resetTargets.save!();
			expect(saved).toHaveBeenCalledWith({ actor: { type: 'self' } });
			wrapper.unmount();
		});

		it('parse 路径：customParse 渲染 actor 文本', () => {
			const contents = Command.cases.resetTargets.parse!({ actor: { type: 'trigger' } });
			expect(contents[0]).toEqual({ color: 'actor' });
			expect(contents[1].text).toContain('command.resetTargets');
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

	describe('useRestoreAudioCommandSchema（restoreAudio 命令表单 composable：insert/edit/save/parse 路径）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			Command.words = markRaw(new Command.WordList());
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		it('insert 路径：打开窗口并 load 默认 form', async () => {
			const wrapper = mount(RestoreAudio, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useRestoreAudioCommandSchema();
			CommandSchema.insert(target, 'restoreAudio');
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('restoreAudio');
			expect(form.type).toBe('bgm');
			wrapper.unmount();
		});

		it('edit 路径：handler.load 解构 params 到 form', async () => {
			const wrapper = mount(RestoreAudio, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useRestoreAudioCommandSchema();
			CommandSchema.edit(target, { id: 'restoreAudio', params: { type: 'bgs' } });
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('restoreAudio');
			expect(form.type).toBe('bgs');
			wrapper.unmount();
		});

		it('save 路径：用户改 form 后经 Command.cases.restoreAudio.save 保存', async () => {
			const wrapper = mount(RestoreAudio, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useRestoreAudioCommandSchema();
			Command.cases.restoreAudio.customLoad!({ type: 'bgm' });
			form.type = 'cv';
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.restoreAudio.save!();
			expect(saved).toHaveBeenCalledWith({ type: 'cv' });
			wrapper.unmount();
		});

		it('parse 路径：customParse 渲染 type 文本', () => {
			const contents = Command.cases.restoreAudio.parse!({ type: 'bgm' });
			expect(contents[0]).toEqual({ color: 'audio' });
			expect(contents[1].text).toContain('command.restoreAudio');
			expect(contents[2].text).toBe('[audio:bgm]');
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
}
{
	initCommandColorBridges();
	initCommandParseBridges();

	const target = {
		scrollAndResize: vi.fn(),
		getSelectionPosition: () => ({ x: 100, y: 100 }),
		save: vi.fn()
	};

	describe('useSetActiveCommandSchema（setActive 命令表单 composable：insert/edit/save/parse 路径）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			Command.words = markRaw(new Command.WordList());
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		it('insert 路径：打开窗口并 load 默认 form', async () => {
			const wrapper = mount(SetActive, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useSetActiveCommandSchema();
			CommandSchema.insert(target, 'setActive');
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('setActive');
			expect(form.actor).toEqual({ type: 'trigger' });
			expect(form.active).toBe(false);
			wrapper.unmount();
		});

		it('edit 路径：handler.load 解构 params 到 form', async () => {
			const wrapper = mount(SetActive, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useSetActiveCommandSchema();
			CommandSchema.edit(target, {
				id: 'setActive',
				params: { actor: { type: 'latest' }, active: true }
			});
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('setActive');
			expect(form.actor).toEqual({ type: 'latest' });
			expect(form.active).toBe(true);
			wrapper.unmount();
		});

		it('save 路径：用户改 form 后经 Command.cases.setActive.save 保存', async () => {
			const wrapper = mount(SetActive, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useSetActiveCommandSchema();
			Command.cases.setActive.customLoad!({ actor: { type: 'trigger' }, active: false });
			form.actor = { type: 'self' };
			form.active = true;
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.setActive.save!();
			expect(saved).toHaveBeenCalledWith({ actor: { type: 'self' }, active: true });
			wrapper.unmount();
		});

		it('parse 路径：customParse 渲染 actor/active 文本', () => {
			const contents = Command.cases.setActive.parse!({
				actor: { type: 'trigger' },
				active: true
			});
			expect(contents[0]).toEqual({ color: 'actor' });
			expect(contents[1].text).toContain('command.setActive');
			expect(contents[2].text).toContain('[actor:trigger]');
			expect(contents[2].text).toContain('command.setActive.active.true');
		});
	});
}
