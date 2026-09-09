import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import { Command } from '@app/commands/command-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { Window } from '@app/tools/window-object.ts';
import { Data } from '@app/data/data-object.ts';
import { VariableGetter } from '@app/commands/accessors/variable-accessor-window.ts';
import ChangeActorSkill from '@app/components/commands/ChangeActorSkill.vue';
import { useChangeActorSkillCommandSchema } from '@app/composables/commands/useChangeActorSkillCommandSchema';
import ChangeActorSprite from '@app/components/commands/ChangeActorSprite.vue';
import { useChangeActorSpriteCommandSchema } from '@app/composables/commands/useChangeActorSpriteCommandSchema';
import { Animation } from '@app/animation/animation-window.ts';
import ChangeActorState from '@app/components/commands/ChangeActorState.vue';
import ChangeActorTeam from '@app/components/commands/ChangeActorTeam.vue';
import ChangePassableTerrain from '@app/components/commands/ChangePassableTerrain.vue';
import ChangeThreat from '@app/components/commands/ChangeThreat.vue';
import { useChangeThreatCommandSchema } from '@app/composables/commands/useChangeThreatCommandSchema';
import ClampCamera from '@app/components/commands/ClampCamera.vue';
import { useClampCameraCommandSchema } from '@app/composables/commands/useClampCameraCommandSchema';
import CommandLine from '@app/components/commands/CommandLine.vue';
import { useCommandLineCommandSchema } from '@app/composables/commands/useCommandLineCommandSchema';
import Comment from '@app/components/commands/Comment.vue';
import { useCommentCommandSchema } from '@app/composables/commands/useCommentCommandSchema';
import ControlButton from '@app/components/commands/ControlButton.vue';
import { useControlButtonCommandSchema } from '@app/composables/commands/useControlButtonCommandSchema';
import '@app/animation/register.ts';

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ syncState: vi.fn() })
}));

{
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

	describe('useChangeActorSkillCommandSchema（changeActorSkill 命令表单 composable：insert/edit/save 路径）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		it('onMounted loadItems 填充 operation 选项', async () => {
			const wrapper = mount(ChangeActorSkill, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const operation = document.getElementById('changeActorSkill-operation') as unknown as {
				dataItems?: Array<{ name: string; value: string }>;
			};
			expect(operation.dataItems).toHaveLength(4);
			wrapper.unmount();
		});

		it('insert 路径：打开窗口并 load 默认 form 到控件 DOM', async () => {
			const wrapper = mount(ChangeActorSkill, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			CommandSchema.insert(target, 'changeActorSkill');
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('changeActorSkill');
			expect(getControl('changeActorSkill-actor').read()).toEqual({ type: 'trigger' });
			expect(getControl('changeActorSkill-operation').read()).toBe('add');
			expect(getControl('changeActorSkill-skillId').read()).toBe('');
			wrapper.unmount();
		});

		it('edit 路径：handler.load 解构 params 到控件 DOM', async () => {
			const wrapper = mount(ChangeActorSkill, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			CommandSchema.edit(target, {
				id: 'changeActorSkill',
				params: {
					actor: { type: 'player' },
					operation: 'remove-instance',
					skill: { type: 'skill' }
				}
			});
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('changeActorSkill');
			expect(getControl('changeActorSkill-operation').read()).toBe('remove-instance');
			expect(getControl('changeActorSkill-skill').read()).toEqual({ type: 'skill' });
			wrapper.unmount();
		});

		it('save 路径：用户改控件后经 Command.cases.changeActorSkill.save 保存', async () => {
			const wrapper = mount(ChangeActorSkill, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useChangeActorSkillCommandSchema();
			Command.cases.changeActorSkill.customLoad!({
				actor: { type: 'trigger' },
				operation: 'add',
				skillId: ''
			});
			form.operation = 'remove';
			form.skillId = 'skill1';
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.changeActorSkill.save!();
			expect(saved).toHaveBeenCalledWith({
				actor: { type: 'trigger' },
				operation: 'remove',
				skillId: 'skill1'
			});
			wrapper.unmount();
		});

		it('save 路径：add/remove 空 skillId 校验失败不保存', async () => {
			const wrapper = mount(ChangeActorSkill, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.changeActorSkill.customLoad!({
				actor: { type: 'trigger' },
				operation: 'add',
				skillId: ''
			});
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.changeActorSkill.save!();
			expect(saved).not.toHaveBeenCalled();
			wrapper.unmount();
		});
	});
}
{
	const target = {
		scrollAndResize: vi.fn(),
		getSelectionPosition: () => ({ x: 100, y: 100 }),
		save: vi.fn()
	};

	const words: string[] = [];
	const setWords = (): void => {
		words.length = 0;
		Command.words = {
			push: (value: string) => {
				words.push(value);
				return Command.words;
			},
			join: (separator?: string) => words.join(separator ?? '')
		} as never;
	};

	describe('useChangeActorSpriteCommandSchema（changeActorSprite 命令表单 composable：insert/edit/save/parse 路径）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			Animation.getSpriteListItems = vi.fn(() => [{ name: 's0', value: 's0' }]) as never;
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		it('insert 路径：打开窗口并 load 默认 form', async () => {
			const wrapper = mount(ChangeActorSprite, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useChangeActorSpriteCommandSchema();
			CommandSchema.insert(target, 'changeActorSprite');
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('changeActorSprite');
			expect(form.actor).toEqual({ type: 'trigger' });
			expect(form.animationId).toBe('');
			wrapper.unmount();
		});

		it('edit 路径：handler.load 解构 params 到 form', async () => {
			const wrapper = mount(ChangeActorSprite, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useChangeActorSpriteCommandSchema();
			CommandSchema.edit(target, {
				id: 'changeActorSprite',
				params: { actor: { type: 'player' }, animationId: 'a1', spriteId: 's1' }
			});
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('changeActorSprite');
			expect(form.actor).toEqual({ type: 'player' });
			expect(form.animationId).toBe('a1');
			wrapper.unmount();
		});

		it('save 校验：animationId/spriteId 必填，为空不保存', async () => {
			const wrapper = mount(ChangeActorSprite, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useChangeActorSpriteCommandSchema();
			Command.cases.changeActorSprite.customLoad!({
				actor: { type: 'trigger' },
				animationId: '',
				spriteId: '',
				image: ''
			});
			form.animationId = '';
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.changeActorSprite.save!();
			expect(saved).not.toHaveBeenCalled();
			wrapper.unmount();
		});

		it('save 路径：form 值经 Command.cases.changeActorSprite.save 保存', async () => {
			const wrapper = mount(ChangeActorSprite, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useChangeActorSpriteCommandSchema();
			Command.cases.changeActorSprite.customLoad!({
				actor: { type: 'trigger' },
				animationId: 'a1',
				spriteId: 's1',
				image: 'img'
			});
			form.spriteId = 's2';
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.changeActorSprite.save!();
			expect(saved).toHaveBeenCalledWith({
				actor: { type: 'trigger' },
				animationId: 'a1',
				spriteId: 's2',
				image: 'img'
			});
			wrapper.unmount();
		});

		it('parse 路径：customParse 渲染 actor + sprite 文本', () => {
			setWords();
			Command.parseActor = vi.fn(
				(a: unknown) => `A:${(a as { type: string }).type}`
			) as never;
			// oxlint-disable-next-line no-base-to-string
			Command.parseFileName = vi.fn((v: unknown) => `F:${String(v)}`) as never;
			Command.parseSpriteName = vi.fn(() => 'SPRITE') as never;
			const contents = Command.cases.changeActorSprite.parse!({
				actor: { type: 'trigger' },
				animationId: 'a1',
				spriteId: 's1',
				image: 'img'
			});
			expect(contents[0]).toHaveProperty('color');
			expect(contents[2]).toHaveProperty('text');
		});
	});
}
{
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

	describe('useChangeActorStateCommandSchema（changeActorState 命令表单 composable：insert/edit/save 分支/校验路径）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		it('onMounted loadItems 填充 operation 选项', async () => {
			const wrapper = mount(ChangeActorState, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const operation = document.getElementById('changeActorState-operation') as unknown as {
				dataItems?: Array<{ name: string; value: string }>;
			};
			expect(operation.dataItems).toHaveLength(3);
			wrapper.unmount();
		});

		it('insert 路径：打开窗口并 load 默认 form 到控件 DOM', async () => {
			const wrapper = mount(ChangeActorState, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			CommandSchema.insert(target, 'changeActorState');
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('changeActorState');
			expect(getControl('changeActorState-actor').read()).toEqual({ type: 'trigger' });
			expect(getControl('changeActorState-operation').read()).toBe('add');
			expect(getControl('changeActorState-stateId').read()).toBe('');
			expect(getControl('changeActorState-state').read()).toEqual({ type: 'trigger' });
			wrapper.unmount();
		});

		it('edit 路径：handler.load 解构 params 到控件 DOM', async () => {
			const wrapper = mount(ChangeActorState, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			CommandSchema.edit(target, {
				id: 'changeActorState',
				params: {
					actor: { type: 'player' },
					operation: 'remove-instance',
					state: { type: 'state' }
				}
			});
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('changeActorState');
			expect(getControl('changeActorState-operation').read()).toBe('remove-instance');
			expect(getControl('changeActorState-state').read()).toEqual({ type: 'state' });
			wrapper.unmount();
		});

		it('save 路径：add/remove 分支保存 stateId', async () => {
			const wrapper = mount(ChangeActorState, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.changeActorState.customLoad!({
				actor: { type: 'trigger' },
				operation: 'add',
				stateId: ''
			});
			getControl('changeActorState-operation').input('remove');
			getControl('changeActorState-stateId').write('state1');
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.changeActorState.save!();
			expect(saved).toHaveBeenCalledWith({
				actor: { type: 'trigger' },
				operation: 'remove',
				stateId: 'state1'
			});
			wrapper.unmount();
		});

		it('save 路径：remove-instance 分支保存 state', async () => {
			const wrapper = mount(ChangeActorState, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.changeActorState.customLoad!({
				actor: { type: 'trigger' },
				operation: 'remove-instance',
				state: { type: 'trigger' }
			});
			getControl('changeActorState-state').write({ type: 'state' });
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.changeActorState.save!();
			expect(saved).toHaveBeenCalledWith({
				actor: { type: 'trigger' },
				operation: 'remove-instance',
				state: { type: 'state' }
			});
			wrapper.unmount();
		});

		it('save 路径：add/remove 空 stateId 校验失败不保存', async () => {
			const wrapper = mount(ChangeActorState, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.changeActorState.customLoad!({
				actor: { type: 'trigger' },
				operation: 'add',
				stateId: ''
			});
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.changeActorState.save!();
			expect(saved).not.toHaveBeenCalled();
			wrapper.unmount();
		});
	});
}
{
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

	describe('useChangeActorTeamCommandSchema（changeActorTeam 命令表单 composable：insert/edit/save 路径）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			Data.teams = { list: [{ id: 'team0', name: 'Team 0' }] } as never;
			Data.createTeamItems = vi.fn(() => [{ name: 'Team 0', value: 'team0' }]) as never;
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		it('insert 路径：打开窗口并 load 默认 form 到控件 DOM', async () => {
			const wrapper = mount(ChangeActorTeam, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			CommandSchema.insert(target, 'changeActorTeam');
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('changeActorTeam');
			expect(getControl('changeActorTeam-actor').read()).toEqual({ type: 'trigger' });
			expect(getControl('changeActorTeam-teamId').read()).toBe('team0');
			wrapper.unmount();
		});

		it('insert 打开即加载队伍下拉选项并显示默认文本（不依赖窗口 open 事件）', async () => {
			const wrapper = mount(ChangeActorTeam, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			CommandSchema.insert(target, 'changeActorTeam');
			await wrapper.vm.$nextTick();
			const team = document.getElementById('changeActorTeam-teamId') as unknown as {
				dataItems?: Array<{ value: string }>;
				invalid?: boolean;
				read(): unknown;
			};
			const text = document.querySelector('#changeActorTeam-teamId .select-box-text');
			// 修复前：下拉只靠窗口 'open' 事件加载选项，open 未触发时选项为空、无默认文本
			expect(team.dataItems?.map((item) => item.value)).toEqual(['team0']);
			expect(team.read()).toBe('team0');
			expect(team.invalid).toBe(false);
			expect(text?.textContent).toBe('Team 0');
			wrapper.unmount();
		});

		it('窗口关闭后 SelectBox 内部文本节点不被删除（可再次打开显示）', async () => {
			const wrapper = mount(ChangeActorTeam, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const select = document.getElementById('changeActorTeam-teamId') as HTMLElement;
			expect(select.querySelector('.select-box-text')).toBeTruthy();
			const frame = document.getElementById('changeActorTeam');
			frame?.dispatchEvent(new Event('closed'));
			await wrapper.vm.$nextTick();
			// 修复前：closed 用 textContent 清空把 .select-box-text 一起删掉，之后再打开下拉永远空白
			expect(select.querySelector('.select-box-text')).toBeTruthy();
			// 关闭后再打开（open 事件重新 loadItems + load 相同默认值）：默认文本仍应显示
			frame?.dispatchEvent(new Event('open'));
			Command.cases.changeActorTeam.customLoad!({
				actor: { type: 'trigger' },
				teamId: 'team0'
			});
			await wrapper.vm.$nextTick();
			const text = document.querySelector('#changeActorTeam-teamId .select-box-text');
			expect(text?.textContent).toBe('Team 0');
			wrapper.unmount();
		});

		it('edit 路径：handler.load 解构 params 到控件 DOM', async () => {
			const wrapper = mount(ChangeActorTeam, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			CommandSchema.edit(target, {
				id: 'changeActorTeam',
				params: { actor: { type: 'trigger' }, teamId: 'team1' }
			});
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('changeActorTeam');
			expect(getControl('changeActorTeam-teamId').read()).toBe('team1');
			wrapper.unmount();
		});

		it('save 路径：用户改控件后经 Command.cases.changeActorTeam.save 保存', async () => {
			const wrapper = mount(ChangeActorTeam, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.changeActorTeam.customLoad!({
				actor: { type: 'trigger' },
				teamId: 'team0'
			});
			getControl('changeActorTeam-teamId').input('team2');
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.changeActorTeam.save!();
			expect(saved).toHaveBeenCalledWith({ actor: { type: 'trigger' }, teamId: 'team2' });
			wrapper.unmount();
		});
	});
}
{
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

	describe('useChangePassableTerrainCommandSchema（changePassableTerrain 命令表单 composable：insert/edit/save 路径）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		it('onMounted loadItems 填充 passage 选项', async () => {
			const wrapper = mount(ChangePassableTerrain, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const passage = document.getElementById('changePassableTerrain-passage') as unknown as {
				dataItems?: Array<{ name: string; value: string }>;
			};
			expect(passage.dataItems).toHaveLength(3);
			expect(passage.dataItems!.map((item) => item.value)).toEqual([
				'land',
				'water',
				'unrestricted'
			]);
			wrapper.unmount();
		});

		it('insert 路径：打开窗口并 load 默认 form 到控件 DOM', async () => {
			const wrapper = mount(ChangePassableTerrain, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			CommandSchema.insert(target, 'changePassableTerrain');
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('changePassableTerrain');
			expect(getControl('changePassableTerrain-actor').read()).toEqual({ type: 'trigger' });
			expect(getControl('changePassableTerrain-passage').read()).toBe('land');
			wrapper.unmount();
		});

		it('edit 路径：handler.load 解构 params 到控件 DOM', async () => {
			const wrapper = mount(ChangePassableTerrain, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			CommandSchema.edit(target, {
				id: 'changePassableTerrain',
				params: { actor: { type: 'trigger' }, passage: 'water' }
			});
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('changePassableTerrain');
			expect(getControl('changePassableTerrain-actor').read()).toEqual({ type: 'trigger' });
			expect(getControl('changePassableTerrain-passage').read()).toBe('water');
			wrapper.unmount();
		});

		it('save 路径：用户改控件后经 Command.cases.changePassableTerrain.save 保存', async () => {
			const wrapper = mount(ChangePassableTerrain, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.changePassableTerrain.customLoad!({
				actor: { type: 'trigger' },
				passage: 'land'
			});
			getControl('changePassableTerrain-passage').input('unrestricted');
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.changePassableTerrain.save!();
			expect(saved).toHaveBeenCalledWith({
				actor: { type: 'trigger' },
				passage: 'unrestricted'
			});
			wrapper.unmount();
		});
	});
}
{
	const target = {
		scrollAndResize: vi.fn(),
		getSelectionPosition: () => ({ x: 100, y: 100 }),
		save: vi.fn()
	};

	const words: string[] = [];
	const setWords = (): void => {
		words.length = 0;
		Command.words = {
			push: (value: string) => {
				words.push(value);
				return Command.words;
			},
			join: (separator?: string) => words.join(separator ?? '')
		} as never;
	};

	describe('useChangeThreatCommandSchema（changeThreat 命令表单 composable：insert/edit/save/parse 路径）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		it('insert 路径：打开窗口并 load 默认 form', async () => {
			const wrapper = mount(ChangeThreat, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useChangeThreatCommandSchema();
			CommandSchema.insert(target, 'changeThreat');
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('changeThreat');
			expect(form.actor).toEqual({ type: 'trigger' });
			expect(form.operation).toBe('increase');
			expect(form.threat).toBe(0);
			wrapper.unmount();
		});

		it('edit 路径：handler.load 解构 params 到 form', async () => {
			const wrapper = mount(ChangeThreat, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useChangeThreatCommandSchema();
			CommandSchema.edit(target, {
				id: 'changeThreat',
				params: { actor: { type: 'player' }, operation: 'decrease', threat: 5 }
			});
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('changeThreat');
			expect(form.actor).toEqual({ type: 'player' });
			expect(form.threat).toBe(5);
			wrapper.unmount();
		});

		it('save 路径：form 值经 Command.cases.changeThreat.save 保存', async () => {
			const wrapper = mount(ChangeThreat, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useChangeThreatCommandSchema();
			Command.cases.changeThreat.customLoad!({
				actor: { type: 'trigger' },
				target: { type: 'player' },
				operation: 'increase',
				threat: 0
			});
			form.threat = 100;
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.changeThreat.save!();
			expect(saved).toHaveBeenCalledWith({
				actor: { type: 'trigger' },
				target: { type: 'player' },
				operation: 'increase',
				threat: 100
			});
			wrapper.unmount();
		});

		it('parse 路径：customParse 渲染 actor + 操作文本', () => {
			setWords();
			Command.parseActor = vi.fn(
				(a: unknown) => `A:${(a as { type: string }).type}`
			) as never;
			// oxlint-disable-next-line no-base-to-string
			Command.parseVariableNumber = vi.fn((v: unknown) => `N:${String(v)}`) as never;
			const contents = Command.cases.changeThreat.parse!({
				actor: { type: 'trigger' },
				target: { type: 'player' },
				operation: 'increase',
				threat: 5
			});
			expect(contents[0]).toHaveProperty('color');
			expect(contents[2]).toHaveProperty('text');
		});
	});
}
{
	const target = {
		scrollAndResize: vi.fn(),
		getSelectionPosition: () => ({ x: 100, y: 100 }),
		save: vi.fn()
	};

	const words: string[] = [];
	const setWords = (): void => {
		words.length = 0;
		Command.words = {
			push: (value: string) => {
				words.push(value);
				return Command.words;
			},
			join: (separator?: string) => words.join(separator ?? '')
		} as never;
	};

	describe('useClampCameraCommandSchema（clampCamera 命令表单 composable：insert/edit/save/parse 路径）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		it('insert 路径：打开窗口并 load 默认 form（四边均为 0）', async () => {
			const wrapper = mount(ClampCamera, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useClampCameraCommandSchema();
			CommandSchema.insert(target, 'clampCamera');
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('clampCamera');
			expect(form.left).toBe(0);
			expect(form.top).toBe(0);
			expect(form.right).toBe(0);
			expect(form.bottom).toBe(0);
			wrapper.unmount();
		});

		it('edit 路径：handler.load 解构 params 到 form', async () => {
			const wrapper = mount(ClampCamera, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useClampCameraCommandSchema();
			CommandSchema.edit(target, {
				id: 'clampCamera',
				params: { left: 1, top: 2, right: 3, bottom: 4 }
			});
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('clampCamera');
			expect(form.left).toBe(1);
			expect(form.bottom).toBe(4);
			wrapper.unmount();
		});

		it('save 路径：form 值经 Command.cases.clampCamera.save 保存', async () => {
			const wrapper = mount(ClampCamera, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useClampCameraCommandSchema();
			Command.cases.clampCamera.customLoad!({ left: 0, top: 0, right: 0, bottom: 0 });
			form.left = 10;
			form.bottom = -10;
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.clampCamera.save!();
			expect(saved).toHaveBeenCalledWith({ left: 10, top: 0, right: 0, bottom: -10 });
			wrapper.unmount();
		});

		it('parse 路径：customParse 渲染四边文本', () => {
			setWords();
			// oxlint-disable-next-line no-base-to-string
			Command.parseVariableNumber = vi.fn((v: unknown) => `N:${String(v)}`) as never;
			const contents = Command.cases.clampCamera.parse!({
				left: 1,
				top: 2,
				right: 3,
				bottom: 4
			});
			expect(contents[0]).toHaveProperty('color');
			expect(contents[2]).toHaveProperty('text');
		});
	});
}
{
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

	describe('useCommandLineCommandSchema（commandLine 命令表单 composable：insert/edit/save/校验路径）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			VariableGetter.isNone = vi.fn((variable: unknown) => {
				return !variable || (variable as { key?: string })?.key === '';
			}) as never;
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		it('onMounted loadItems 填充 type 选项', async () => {
			const wrapper = mount(CommandLine, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const type = document.getElementById('commandLine-type') as unknown as {
				dataItems?: Array<{ name: string; value: string }>;
			};
			expect(type.dataItems).toHaveLength(4);
			wrapper.unmount();
		});

		it('insert 路径：打开窗口并 load 默认 form 到控件 DOM', async () => {
			const wrapper = mount(CommandLine, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			CommandSchema.insert(target, 'commandLine');
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('commandLine');
			expect(getControl('commandLine-type').read()).toBe('get');
			expect(getControl('commandLine-key').read()).toBe('');
			expect(getControl('commandLine-value').read()).toBe('');
			expect(getControl('commandLine-variable').read()).toEqual({ type: 'local', key: '' });
			wrapper.unmount();
		});

		it('edit 路径：handler.load 解构 params 到控件 DOM', async () => {
			const wrapper = mount(CommandLine, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			CommandSchema.edit(target, {
				id: 'commandLine',
				params: {
					type: 'set',
					key: 'foo',
					value: 'bar',
					variable: { type: 'local', key: 'v' }
				}
			});
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('commandLine');
			expect(getControl('commandLine-type').read()).toBe('set');
			expect(getControl('commandLine-key').read()).toBe('foo');
			expect(getControl('commandLine-value').read()).toBe('bar');
			wrapper.unmount();
		});

		it('save 路径：用户改控件后经 Command.cases.commandLine.save 保存', async () => {
			const wrapper = mount(CommandLine, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useCommandLineCommandSchema();
			Command.cases.commandLine.customLoad!({
				type: 'get',
				key: '',
				value: '',
				variable: { type: 'local', key: 'v' }
			});
			form.type = 'set';
			form.key = 'foo';
			form.value = 'bar';
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.commandLine.save!();
			expect(saved).toHaveBeenCalledWith({
				type: 'set',
				key: 'foo',
				value: 'bar',
				variable: { type: 'local', key: 'v' }
			});
			wrapper.unmount();
		});

		it('save 路径：空 key 校验失败不保存', async () => {
			const wrapper = mount(CommandLine, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.commandLine.customLoad!({
				type: 'get',
				key: '',
				value: '',
				variable: { type: 'local', key: 'v' }
			});
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.commandLine.save!();
			expect(saved).not.toHaveBeenCalled();
			wrapper.unmount();
		});

		it('save 路径：variable 无效校验失败不保存', async () => {
			const wrapper = mount(CommandLine, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.commandLine.customLoad!({
				type: 'get',
				key: 'foo',
				value: '',
				variable: { type: 'local', key: '' }
			});
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.commandLine.save!();
			expect(saved).not.toHaveBeenCalled();
			wrapper.unmount();
		});
	});
}
{
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

	describe('useCommentCommandSchema（comment 命令表单 composable：insert/edit/save 路径）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		it('insert 路径：打开窗口并 load 默认 form 到控件 DOM', async () => {
			const wrapper = mount(Comment, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			CommandSchema.insert(target, 'comment');
			expect(Window.open).toHaveBeenCalledWith('comment');
			expect(getControl('comment-comment').read()).toBe('');
			wrapper.unmount();
		});

		it('edit 路径：handler.load 解构 params 到控件 DOM', async () => {
			const wrapper = mount(Comment, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			CommandSchema.edit(target, { id: 'comment', params: { comment: 'hello\nworld' } });
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('comment');
			expect(getControl('comment-comment').read()).toBe('hello\nworld');
			wrapper.unmount();
		});

		it('save 路径：comment 为空时校验失败不保存', async () => {
			const wrapper = mount(Comment, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			Command.cases.comment.customLoad!({ comment: '' });
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.comment.save!();
			expect(saved).not.toHaveBeenCalled();
			wrapper.unmount();
		});

		it('save 路径：用户输入后经 Command.cases.comment.save 保存', async () => {
			const wrapper = mount(Comment, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useCommentCommandSchema();
			Command.cases.comment.customLoad!({ comment: '' });
			form.comment = 'hello';
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.comment.save!();
			expect(saved).toHaveBeenCalledWith({ comment: 'hello' });
			wrapper.unmount();
		});
	});
}
{
	const target = {
		scrollAndResize: vi.fn(),
		getSelectionPosition: () => ({ x: 100, y: 100 }),
		save: vi.fn()
	};

	interface ControlEl extends HTMLElement {
		read(): unknown;
		write(value: unknown): void;
		input(value: unknown): void;
	}

	const getControl = (id: string): ControlEl =>
		document.getElementById(id) as unknown as ControlEl;

	const words: string[] = [];
	const setWords = (): void => {
		words.length = 0;
		Command.words = {
			push: (value: string) => {
				words.push(value);
				return Command.words;
			},
			join: (separator?: string) => words.join(separator ?? '')
		} as never;
	};

	describe('useControlButtonCommandSchema（controlButton 命令表单 composable：insert/edit/save/parse 路径）', () => {
		beforeEach(() => {
			setActivePinia(createPinia());
			Window.open = vi.fn();
			Window.close = vi.fn();
		});

		it('insert 路径：打开窗口并 load 默认 form', async () => {
			const wrapper = mount(ControlButton, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useControlButtonCommandSchema();
			CommandSchema.insert(target, 'controlButton');
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('controlButton');
			expect(form.operation).toBe('select-default');
			wrapper.unmount();
		});

		it('edit 路径：handler.load 解构 params 到 form', async () => {
			const wrapper = mount(ControlButton, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useControlButtonCommandSchema();
			CommandSchema.edit(target, {
				id: 'controlButton',
				params: { operation: 'select', element: { type: 'player' } }
			});
			await wrapper.vm.$nextTick();
			expect(Window.open).toHaveBeenCalledWith('controlButton');
			expect(form.operation).toBe('select');
			expect(form.element).toEqual({ type: 'player' });
			wrapper.unmount();
		});

		it('save 路径：select 操作保存 operation + element', async () => {
			const wrapper = mount(ControlButton, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useControlButtonCommandSchema();
			Command.cases.controlButton.customLoad!({
				operation: 'select',
				element: { type: 'trigger' }
			});
			form.operation = 'select';
			form.element = { type: 'button' };
			getControl('controlButton-element').input({ type: 'button' });
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.controlButton.save!();
			expect(saved).toHaveBeenCalledWith({
				operation: 'select',
				element: { type: 'button' }
			});
			wrapper.unmount();
		});

		it('save 路径：select-default 仅保存 operation', async () => {
			const wrapper = mount(ControlButton, { attachTo: document.body });
			await wrapper.vm.$nextTick();
			const { form } = useControlButtonCommandSchema();
			Command.cases.controlButton.customLoad!({
				operation: 'select-default',
				element: { type: 'trigger' }
			});
			form.operation = 'select-default';
			form.element = { type: 'button' };
			const saved = vi.fn();
			Command.save = saved;
			Command.cases.controlButton.save!();
			expect(saved).toHaveBeenCalledWith({ operation: 'select-default' });
			wrapper.unmount();
		});

		it('parse 路径：customParse 渲染操作文本', () => {
			setWords();
			Command.parseElement = vi.fn(
				(e: unknown) => `E:${(e as { type: string }).type}`
			) as never;
			const contents = Command.cases.controlButton.parse!({
				operation: 'select',
				element: { type: 'button' }
			});
			expect(contents[0]).toHaveProperty('color');
			expect(contents[2]).toHaveProperty('text');
		});
	});
}
