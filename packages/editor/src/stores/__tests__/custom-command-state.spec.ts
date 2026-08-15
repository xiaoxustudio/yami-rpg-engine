import { describe, expect, it } from 'vitest';
import { getCustomCommandStore, customCommandStateKeys } from '@app/stores/customCommand';
import { CustomCommand } from '@/command/custom-command-window.ts';

describe('useCustomCommandStore（CustomCommand 状态反转：store 为源）', () => {
	it('初始状态默认值', () => {
		const store = getCustomCommandStore();
		expect(store.state).toBe('closed');
		expect(store.commands).toEqual([]);
	});

	it('状态键完整（2 项）', () => {
		const store = getCustomCommandStore();
		expect(customCommandStateKeys).toHaveLength(2);
		for (const key of customCommandStateKeys) {
			expect(key in store, String(key)).toBe(true);
		}
	});

	it('字段直接赋值读回', () => {
		const store = getCustomCommandStore();
		store.state = 'open';
		expect(store.state).toBe('open');
		store.commands = [{ id: 'c1', enabled: true, alias: '', keywords: '' }];
		expect(store.commands[0].id).toBe('c1');
		store.state = 'closed';
		store.commands = [];
	});

	it('legacy 写入经 store 生效（store 为源）', () => {
		const store = getCustomCommandStore();
		CustomCommand.state = 'open';
		expect(store.state).toBe('open');
		CustomCommand.state = 'closed';
		expect(store.state).toBe('closed');
		CustomCommand.commands = [{ id: 'c1', enabled: true, alias: '', keywords: '' }];
		expect(store.commands[0].id).toBe('c1');
		CustomCommand.commands = [];
		expect(store.commands).toEqual([]);
	});

	it('store 写入经桥反向可读（外部 legacy 读取兼容）', () => {
		const store = getCustomCommandStore();
		store.state = 'open';
		expect(CustomCommand.state).toBe('open');
		store.state = 'closed';
		expect(CustomCommand.state).toBe('closed');
		store.commands = [{ id: 'c2', enabled: false, alias: '', keywords: '' }];
		expect(CustomCommand.commands?.[0].id).toBe('c2');
		store.commands = [];
	});
});
