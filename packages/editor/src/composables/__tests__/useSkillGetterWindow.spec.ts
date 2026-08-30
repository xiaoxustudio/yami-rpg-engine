import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import SkillGetter from '@app/components/tools/SkillGetter.vue';
import { useSkillGetterWindow } from '@app/composables/useSkillGetterWindow';
import { Window } from '@app/tools/window-object.ts';
import { SkillGetter as SkillGetterController } from '@app/commands/accessors/skill-accessor-window.ts';
import { Enum } from '@app/enum/enum-window.ts';

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ syncState: vi.fn() })
}));

const getFrame = (id: string): HTMLElement => document.getElementById(id) as HTMLElement;

const makeTarget = (read?: () => unknown) => ({
	dataValue: undefined,
	read,
	input: vi.fn()
});

describe('useSkillGetterWindow（技能访问器窗口 composable：form 状态 + open/confirm/closed）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
		Enum.getStringItems = vi.fn(() => [{ name: 'Space', value: 'space' }]) as never;
		Enum.getDefStringId = vi.fn(() => 'space') as never;
	});

	it('open 打开窗口、解析 read 数据填充 form', async () => {
		const wrapper = mount(SkillGetter, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const skillGetter = useSkillGetterWindow();
		const target = makeTarget(() => ({
			type: 'by-key',
			actor: { type: 'trigger' },
			key: 'enter'
		}));
		skillGetter.open(target as never);
		expect(Window.open).toHaveBeenCalledWith('skillGetter');
		expect(skillGetter.form.type).toBe('by-key');
		expect(skillGetter.form.key).toBe('enter');
		wrapper.unmount();
	});

	it('confirm 经 form 读回值回调并关闭窗口（by-id 含 actor）', async () => {
		const wrapper = mount(SkillGetter, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const skillGetter = useSkillGetterWindow();
		const target = makeTarget(() => ({
			type: 'by-id',
			actor: { type: 'trigger' },
			skillId: 'skill-1'
		}));
		skillGetter.open(target as never);
		skillGetter.form.type = 'by-id';
		skillGetter.form.actor = { type: 'actor', key: 'a1' } as { type: string; key?: string };
		skillGetter.form.skillId = 'skill-2';
		skillGetter.confirm();
		expect(target.input).toHaveBeenCalledWith({
			type: 'by-id',
			actor: { type: 'actor', key: 'a1' },
			skillId: 'skill-2'
		});
		expect(Window.close).toHaveBeenCalledWith('skillGetter');
		wrapper.unmount();
	});

	it('confirm 校验失败（by-key 未选键）聚焦控件且不回调不关闭', async () => {
		const wrapper = mount(SkillGetter, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const skillGetter = useSkillGetterWindow();
		const target = makeTarget(() => ({
			type: 'by-key',
			actor: { type: 'trigger' },
			key: 'enter'
		}));
		skillGetter.open(target as never);
		skillGetter.form.type = 'by-key';
		skillGetter.form.key = '';
		skillGetter.confirm();
		expect(target.input).not.toHaveBeenCalled();
		expect(Window.close).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('plugin 输入在回调前包裹 getter 标识', async () => {
		const wrapper = mount(SkillGetter, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const skillGetter = useSkillGetterWindow();
		const target = makeTarget(() => ({ type: 'trigger' }));
		(target as { isPluginInput?: boolean }).isPluginInput = true;
		skillGetter.open(target as never);
		skillGetter.confirm();
		expect(target.input).toHaveBeenCalledWith({ getter: 'skill', type: 'trigger' });
		expect(Window.close).toHaveBeenCalledWith('skillGetter');
		wrapper.unmount();
	});

	it('closed 事件清除回调，后续 confirm 不再触发', async () => {
		const wrapper = mount(SkillGetter, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const skillGetter = useSkillGetterWindow();
		const target = makeTarget(() => ({ type: 'trigger' }));
		skillGetter.open(target as never);
		getFrame('skillGetter').dispatchEvent(new CustomEvent('closed'));
		skillGetter.confirm();
		expect(target.input).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('legacy SkillGetter.open/confirm 转发 composable 并回调 target.input', async () => {
		const wrapper = mount(SkillGetter, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const skillGetter = useSkillGetterWindow();
		const target = makeTarget(() => ({
			type: 'by-key',
			actor: { type: 'trigger' },
			key: 'enter'
		}));
		SkillGetterController.open!(target as never);
		expect(Window.open).toHaveBeenCalledWith('skillGetter');
		expect(skillGetter.form.type).toBe('by-key');
		expect(skillGetter.form.key).toBe('enter');
		skillGetter.form.key = 'space';
		SkillGetterController.confirm!({} as Event);
		expect(target.input).toHaveBeenCalledWith({
			type: 'by-key',
			actor: { type: 'trigger' },
			key: 'space'
		});
		expect(Window.close).toHaveBeenCalledWith('skillGetter');
		wrapper.unmount();
	});
});
