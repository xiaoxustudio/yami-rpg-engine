import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import Comment from '@app/components/commands/Comment.vue';
import { Command } from '@app/commands/command-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { useCommentCommandSchema } from '@app/composables/commands/useCommentCommandSchema';
import { Window } from '@app/tools/window-object.ts';

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
