import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import SkillGetterWindow from '@app/components/tools/SkillGetter.vue';
import { useSkillGetterWindow } from '@app/composables/useSkillGetterWindow';
import { SkillGetter } from '@app/commands/accessors/skill-accessor-window.ts';
import { Window } from '@app/tools/window-object.ts';
import { Enum } from '@app/enum/enum-window.ts';

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ getLabel: () => '', syncState: vi.fn() })
}));

const makeTarget = (read?: () => unknown) => ({
	dataValue: undefined,
	read,
	input: vi.fn()
});

describe('SkillGetter（技能访问器窗口转发契约）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
		Enum.getDefStringId = vi.fn(() => 'key-1');
		Enum.getStringItems = vi.fn(() => []);
	});

	it('open 转发 composable 并解析 read 数据填充 form', async () => {
		const wrapper = mount(SkillGetterWindow, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const target = makeTarget(() => ({ type: 'by-id', skillId: 's1' }));
		SkillGetter.open!(target as never);
		expect(Window.open).toHaveBeenCalledWith('skillGetter');
		expect(useSkillGetterWindow().form.type).toBe('by-id');
		expect(Enum.getDefStringId).toHaveBeenCalledWith('shortcut-key');
		wrapper.unmount();
	});

	it('confirm 转发 composable 并经 form 回调 target.input', async () => {
		const wrapper = mount(SkillGetterWindow, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const target = makeTarget(() => ({ type: 'trigger' }));
		SkillGetter.open!(target as never);
		const skillGetter = useSkillGetterWindow();
		skillGetter.form.type = 'by-id';
		skillGetter.form.skillId = 's2';
		SkillGetter.confirm!({} as Event);
		expect(target.input).toHaveBeenCalledWith({
			type: 'by-id',
			actor: { type: 'trigger' },
			skillId: 's2'
		});
		expect(Window.close).toHaveBeenCalledWith('skillGetter');
		wrapper.unmount();
	});

	it('checkDataForPlugin 匹配 getter=skill', () => {
		expect(SkillGetter.checkDataForPlugin!({ getter: 'skill' })).toBe(true);
		expect(SkillGetter.checkDataForPlugin!({ getter: 'state' })).toBe(false);
	});

	it('createDefaultForPlugin 返回默认结构', () => {
		expect(SkillGetter.createDefaultForPlugin!()).toEqual({ getter: 'skill', type: 'trigger' });
	});
});
