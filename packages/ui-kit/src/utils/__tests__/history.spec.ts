import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HistoryTimer, NumberHistory, TextHistory, CommandHistory } from '../history';

beforeEach(() => {
	document.execCommand = vi.fn() as any;
});

function makeInput(value = '') {
	const input = document.createElement('input');
	input.value = value;
	document.body.appendChild(input);
	return input;
}

describe('HistoryTimer', () => {
	it('starts and finishes', () => {
		vi.useFakeTimers();
		expect(HistoryTimer.complete).toBe(true);
		HistoryTimer.start('insertText');
		expect(HistoryTimer.complete).toBe(false);
		expect(HistoryTimer.type).toBe('insertText');
		HistoryTimer.finish();
		expect(HistoryTimer.complete).toBe(true);
		vi.useRealTimers();
	});

	it('auto completes after duration', () => {
		vi.useFakeTimers();
		HistoryTimer.start('insertText');
		vi.advanceTimersByTime(2000);
		expect(HistoryTimer.complete).toBe(true);
		vi.useRealTimers();
	});
});

describe('NumberHistory', () => {
	it('tracks stack and canUndo/canRedo', () => {
		const input = makeInput('1');
		const history = new NumberHistory(input);
		history.history = history;
		(input as any).history = history;
		history.lastValue = '1';
		history.save();
		history.save();
		expect(history.stack.length).toBe(2);
		expect(history.canUndo()).toBe(true);
		expect(history.canRedo()).toBe(false);
		history.restore('undo');
		expect(history.canRedo()).toBe(true);
		history.reset();
		expect(history.stack.length).toBe(0);
		input.remove();
	});

	it('keydown ctrl+Z triggers undo via history', () => {
		const input = makeInput('5');
		const history = new NumberHistory(input);
		history.history = history;
		(input as any).history = history;
		history.lastValue = '5';
		history.save();
		history.lastValue = '6';
		const restore = vi.spyOn(history, 'restore');
		const event = new KeyboardEvent('keydown', { key: 'z', code: 'KeyZ', ctrlKey: true });
		Object.defineProperty(event, 'cmdOrCtrlKey', { value: true });
		input.dispatchEvent(event);
		expect(restore).toHaveBeenCalledWith('undo');
		input.remove();
	});
});

describe('TextHistory', () => {
	it('save/restore roundtrip', () => {
		const input = makeInput('hello');
		const history = new TextHistory(input);
		history.history = history;
		(input as any).history = history;
		history.updateStates({ inputType: 'insertText', data: 'x' });
		history.updateSelection({ data: 'x' });
		history.inputType = 'insertText';
		history.inserted = 'x';
		history.deleted = '';
		history.save();
		expect(history.stack.length).toBe(1);
		expect(history.canUndo()).toBe(true);
		history.restore('undo');
		expect(history.canRedo()).toBe(true);
		input.remove();
	});
});

describe('CommandHistory', () => {
	it('save/restore basic stack semantics', () => {
		const list = {
			unfoldCommand: vi.fn(),
			update: vi.fn(),
			select: vi.fn(),
			scrollToSelection: vi.fn(),
			getRangeByData: () => [0, 1],
			enableItems: vi.fn(),
			disableItems: vi.fn(),
			dispatchEvent: vi.fn()
		};
		const history = new CommandHistory(list as any);
		history.save({ type: 'insert', parent: null, array: [], index: 0, commands: [{}] });
		expect(history.stack.length).toBe(1);
		expect(history.canUndo()).toBe(true);
		expect(history.canRedo()).toBe(false);
		history.restore('undo');
		expect(history.canRedo()).toBe(true);
		history.reset();
		expect(history.stack.length).toBe(0);
	});

	it('saveState/restoreState batches undo', () => {
		const list = {
			unfoldCommand: vi.fn(),
			update: vi.fn(),
			select: vi.fn(),
			scrollToSelection: vi.fn(),
			getRangeByData: () => [0, 1],
			enableItems: vi.fn(),
			disableItems: vi.fn(),
			dispatchEvent: vi.fn()
		};
		const history = new CommandHistory(list as any);
		history.save({ type: 'toggle', parent: null, method: 'enable', commands: [{}] });
		history.saveState();
		history.save({ type: 'toggle', parent: null, method: 'enable', commands: [{}] });
		const ok = history.restoreState();
		expect(ok).toBe(true);
	});
});
