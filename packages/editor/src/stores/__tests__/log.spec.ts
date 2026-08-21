import { describe, expect, it } from 'vitest';
import '@app/tools/window-object.ts';
import { Log } from '@app/log/log-window.ts';
import { getLogStore } from '@app/stores/log';

describe('useLogStore（Log 状态反转：store 为源）', () => {
	it('初始状态默认值', () => {
		const store = getLogStore();
		expect(store.logs).toEqual([]);
	});

	it('legacy 写入经 store 生效（store 为源）', () => {
		const store = getLogStore();
		Log.list = [{ type: 'log', message: 'hello', duration: 6 }];
		expect(store.logs).toHaveLength(1);
		expect(store.logs[0].message).toBe('hello');
		Log.print!({ type: 'log', message: 'world', duration: 6 });
		expect(store.logs).toHaveLength(2);
		Log.clear!();
		expect(store.logs).toHaveLength(0);
		Log.list = [];
	});

	it('store 写入经桥反向可读（外部 legacy 读取兼容）', () => {
		const store = getLogStore();
		store.logs = [{ type: 'error', message: 'boom', duration: 3 }];
		expect(Log.list).toHaveLength(1);
		expect(Log.list[0].message).toBe('boom');
		store.logs = [];
		expect(Log.list).toHaveLength(0);
	});

	it('tick 到期清理日志条目', () => {
		const store = getLogStore();
		Log.list = [
			{ type: 'log', message: 'expired', duration: 1 },
			{ type: 'log', message: 'alive', duration: 5 }
		];
		Log.tick!();
		expect(store.logs).toHaveLength(1);
		expect(store.logs[0].message).toBe('alive');
		Log.clear!();
	});
});
