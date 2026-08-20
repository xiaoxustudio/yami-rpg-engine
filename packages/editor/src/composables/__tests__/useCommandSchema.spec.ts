import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Command } from '@app/commands/command-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

describe('useCommandSchema 通用机制（B 类 fields 驱动表单）', () => {
	beforeEach(() => {
		Command.cases.fakePilot = new CommandSchema({
			name: 'fakePilot',
			fields: [
				{ key: 'a', default: 1 },
				{ key: 'b', default: 'x' },
				{ key: 'c', required: true }
			]
		});
	});
	afterEach(() => {
		delete Command.cases.fakePilot;
	});

	it('form 默认值延迟求值（load 时生成，避免启动期 Data 未加载），load 解构 params 覆盖默认', () => {
		const { form, load } = useCommandSchema('fakePilot');
		expect(form.a).toBeUndefined();
		load({ a: 5, b: 'y' });
		expect(form.a).toBe(5);
		expect(form.b).toBe('y');
		expect(form.c).toBeUndefined();
		load({});
		expect(form.a).toBe(1);
		expect(form.b).toBe('x');
	});

	it('save 校验 required 失败时不调用 Command.save', () => {
		const { load, save } = useCommandSchema('fakePilot');
		const saved = vi.fn();
		Command.save = saved;
		load({ a: 1, b: 'x', c: '' });
		save();
		expect(saved).not.toHaveBeenCalled();
	});

	it('save 通过 required 校验后调用 Command.save', () => {
		const { load, save } = useCommandSchema('fakePilot');
		const saved = vi.fn();
		Command.save = saved;
		load({ a: 2, b: 'y', c: 'z' });
		save();
		expect(saved).toHaveBeenCalledWith({ a: 2, b: 'y', c: 'z' });
	});

	it('注册表契约：Command.cases.load/save 转发到 composable（事件编辑器 open/edit/save 路径）', () => {
		const { form } = useCommandSchema('fakePilot');
		Command.cases.fakePilot.load({ a: 9, b: 'w', c: 'ok' });
		expect(form.a).toBe(9);
		expect(form.b).toBe('w');
		expect(form.c).toBe('ok');
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.fakePilot.save();
		expect(saved).toHaveBeenCalledWith({ a: 9, b: 'w', c: 'ok' });
	});

	it('initialize 被接管（onInitialize 置空，不绑定 confirm 避免双保存）', () => {
		useCommandSchema('fakePilot');
		expect(Command.cases.fakePilot.initialize()).toBe(true);
	});
});
