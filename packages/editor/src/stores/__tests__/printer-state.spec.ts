import { describe, expect, it } from 'vitest';
import { getPrinterStore } from '@app/stores/printer';
import { Printer } from '@app/printer/printer.ts';

const PrinterState = Printer as typeof Printer & { state: string | null };

describe('usePrinterStore（Printer 状态反转：store 为源）', () => {
	it('初始状态默认值', () => {
		const store = getPrinterStore();
		expect(store.state).toBe('closed');
	});

	it('字段直接赋值读回', () => {
		const store = getPrinterStore();
		store.state = 'open';
		expect(store.state).toBe('open');
		store.state = 'closed';
	});

	it('legacy 写入经 store 生效（store 为源）', () => {
		const store = getPrinterStore();
		PrinterState.state = 'open';
		expect(store.state).toBe('open');
		PrinterState.state = 'closed';
		expect(store.state).toBe('closed');
	});

	it('store 写入经桥反向可读（外部 legacy 读取兼容）', () => {
		const store = getPrinterStore();
		store.state = 'open';
		expect(PrinterState.state).toBe('open');
		store.state = 'closed';
		expect(PrinterState.state).toBe('closed');
	});
});
