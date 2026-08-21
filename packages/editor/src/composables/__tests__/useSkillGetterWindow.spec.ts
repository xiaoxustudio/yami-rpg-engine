import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import SkillGetter from '@app/components/tools/SkillGetter.vue';
import { useSkillGetterWindow } from '@app/composables/useSkillGetterWindow';
import { Window } from '@app/tools/window-object.ts';
import { SkillGetter as SkillGetterController } from '@app/commands/accessors/skill-accessor-window.ts';
import { Enum } from '@app/enum/enum-window.ts';

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ getLabel: () => '', syncState: vi.fn() })
}));

interface FormFrame extends HTMLElement {
	setForm(data: Record<string, unknown>): void;
	getForm(): Record<string, unknown>;
}

interface ControlEl extends HTMLElement {
	write(value: unknown): void;
	read(): unknown;
}

const getFrame = (id: string): FormFrame => document.getElementById(id) as unknown as FormFrame;

const getControl = (id: string): ControlEl => document.getElementById(id) as unknown as ControlEl;

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

	it('open 打开窗口、解析 read 数据填充 form 与控件 DOM 并写入回调', async () => {
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
		expect(getFrame('skillGetter').getForm().type).toBe('by-key');
		expect(getFrame('skillGetter').getForm().key).toBe('enter');
		expect(getControl('skillGetter-type').read()).toBe('by-key');
		expect(getControl('skillGetter-key').read()).toBe('enter');
		wrapper.unmount();
	});

	it('confirm 经 getForm 读回控件值回调并关闭窗口（by-id 含 actor）', async () => {
		const wrapper = mount(SkillGetter, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const skillGetter = useSkillGetterWindow();
		const target = makeTarget(() => ({
			type: 'by-id',
			actor: { type: 'trigger' },
			skillId: 'skill-1'
		}));
		skillGetter.open(target as never);
		getControl('skillGetter-type').write('by-id');
		getControl('skillGetter-actor').write({ type: 'actor', key: 'a1' });
		getControl('skillGetter-skillId').write('skill-2');
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
		getControl('skillGetter-type').write('by-key');
		getControl('skillGetter-key').write('');
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
		const target = makeTarget(() => ({
			type: 'by-key',
			actor: { type: 'trigger' },
			key: 'enter'
		}));
		SkillGetterController.open!(target as never);
		expect(Window.open).toHaveBeenCalledWith('skillGetter');
		expect(getControl('skillGetter-type').read()).toBe('by-key');
		expect(getControl('skillGetter-key').read()).toBe('enter');
		getControl('skillGetter-key').write('space');
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
