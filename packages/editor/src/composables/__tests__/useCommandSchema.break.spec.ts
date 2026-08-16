import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { Command } from '@/command/command-object.ts';
import { CommandSchema } from '@/module/command/schema.ts';
import { Window } from '@/tools/window-object.ts';
import '@/module/command/break.ts';

const target = {
	scrollAndResize: vi.fn(),
	getSelectionPosition: () => ({ x: 0, y: 0 }),
	save: vi.fn()
};

describe('break noWindow 通道（N 类：事件编辑器直接 save 不经 load）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('noWindow 注册：load/initialize 为空、customSave 直存', () => {
		const handler = Command.cases.break;
		expect(handler.noWindow).toBe(true);
		expect(handler.load).toBeNull();
		expect(handler.initialize).toBeNull();
		expect(typeof handler.save).toBe('function');
	});

	it('insert/open 直接 save：不打开窗口、不经 load', () => {
		const saved = vi.fn();
		Command.save = saved;
		CommandSchema.insert(target, 'break');
		expect(Window.open).not.toHaveBeenCalled();
		expect(saved).toHaveBeenCalledWith({});
	});

	it('edit 对 noWindow 指令无效：不触发 load/save', () => {
		const saved = vi.fn();
		Command.save = saved;
		CommandSchema.edit(target, { id: 'break', params: {} });
		expect(Window.open).not.toHaveBeenCalled();
		expect(saved).not.toHaveBeenCalled();
	});
});
