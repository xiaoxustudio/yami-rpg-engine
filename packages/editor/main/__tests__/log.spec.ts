// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { setDebugMode, debugLog } from '../log.ts';

describe('debugLog 门控（setDebugMode 控制 console.log 是否输出）', () => {
	beforeEach(() => {
		setDebugMode(false);
		vi.spyOn(console, 'log').mockImplementation(() => undefined);
	});

	afterEach(() => {
		setDebugMode(false);
		vi.restoreAllMocks();
	});

	it('setDebugMode(false) 时 debugLog 不输出', () => {
		setDebugMode(false);
		debugLog('message');
		expect(console.log).not.toHaveBeenCalled();
	});

	it('setDebugMode(true) 时 debugLog 输出全部参数', () => {
		setDebugMode(true);
		debugLog('a', 1, { b: 2 });
		expect(console.log).toHaveBeenCalledWith('a', 1, { b: 2 });
	});

	it('默认（未设置）状态不输出', () => {
		setDebugMode(false);
		debugLog('x');
		expect(console.log).not.toHaveBeenCalled();
	});

	it('门控在多次切换后仍正确', () => {
		setDebugMode(true);
		debugLog('on');
		expect(console.log).toHaveBeenCalledWith('on');
		vi.clearAllMocks();
		setDebugMode(false);
		debugLog('off');
		expect(console.log).not.toHaveBeenCalled();
	});
});
