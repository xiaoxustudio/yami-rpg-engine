import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import YMCommandList from '../YMCommandList.vue';
import { createCommandListElement, type CommandListApiOptions } from '../command-api';

interface CommandListElement extends HTMLElement {
	[k: string]: unknown;
	read: () => unknown;
	write: (data: unknown) => void;
	update: () => void;
	select: (start: number, end?: number) => void;
	unselect: () => void;
	selectAll: () => void;
	insert: (id?: string) => void;
	edit: (data?: unknown) => void;
	copy: () => void;
	paste: () => void;
	delete: () => void;
	undo: () => void;
	redo: () => void;
	save: (command: unknown) => void;
	toggle: () => void;
	clear: () => HTMLElement;
	data: unknown;
	start: number | null;
	end: number | null;
	elements: { count: number };
	history: { canUndo: () => boolean; canRedo: () => boolean };
}

const makeCommand = (id: string, params: Record<string, unknown> = {}) => ({
	id,
	params,
	commands: []
});

const mockHeight = (el: HTMLElement): void => {
	Object.defineProperty(el, 'clientHeight', { value: 400, configurable: true });
	Object.defineProperty(el, 'innerHeight', { value: 400, configurable: true });
};

class MockHistory {
	stack: { array: unknown[]; snapshot: unknown[] }[] = [];
	index = 0;
	save(data: { array?: unknown[]; commands?: unknown[] }): void {
		this.stack = this.stack.slice(0, this.index);
		this.stack.push({
			array: data.array as unknown[],
			snapshot: JSON.parse(JSON.stringify(data.array ?? []))
		});
		this.index = this.stack.length;
	}
	restore(mode: string): void {
		if (mode === 'undo' && this.index > 0) {
			this.index--;
			const { array, snapshot } = this.stack[this.index];
			array.splice(0, array.length, ...snapshot);
		} else if (mode === 'redo' && this.index < this.stack.length) {
			this.index++;
		}
	}
	canUndo(): boolean {
		return this.index > 0;
	}
	canRedo(): boolean {
		return this.index < this.stack.length;
	}
}

const makeOptions = (overrides: Partial<CommandListApiOptions> = {}): CommandListApiOptions => ({
	command: {
		parse: (item: Record<string, unknown>) => [{ color: 'normal' }, { text: String(item.id) }],
		fetchVariables: () => [],
		insert: vi.fn(),
		edit: vi.fn(),
		parseUnlinkedId: (id: string) => id,
		colorizeCodeLines: vi.fn()
	},
	clipboard: {
		write: vi.fn(),
		read: () => [],
		has: () => false
	},
	commandHistory: MockHistory as unknown as CommandListApiOptions['commandHistory'],
	localize: {
		language: 'zh-CN',
		get: (key: string) => key,
		createGetter: () => (key: string) => key
	},
	...overrides
});

describe('YMCommandList', () => {
	it('mounts with command-list class and id', () => {
		const wrapper = mount(YMCommandList, { props: { id: 'cmd-list' } });
		expect(wrapper.element.classList.contains('command-list')).toBe(true);
		expect(wrapper.element.id).toBe('cmd-list');
	});

	it('createCommandListElement creates list with api', () => {
		const el = createCommandListElement(makeOptions()) as CommandListElement;
		expect(el.classList.contains('command-list')).toBe(true);
		expect(typeof el.read).toBe('function');
		expect(typeof el.write).toBe('function');
		expect(typeof el.update).toBe('function');
		expect(typeof el.select).toBe('function');
		expect(typeof el.unselect).toBe('function');
		expect(typeof el.insert).toBe('function');
		expect(typeof el.edit).toBe('function');
		expect(typeof el.copy).toBe('function');
		expect(typeof el.paste).toBe('function');
		expect(typeof el.delete).toBe('function');
		expect(typeof el.undo).toBe('function');
		expect(typeof el.redo).toBe('function');
		expect(typeof el.save).toBe('function');
		expect(typeof el.toggle).toBe('function');
		expect(typeof el.clear).toBe('function');
	});

	it('write renders command items and read returns data', () => {
		const el = createCommandListElement(makeOptions()) as CommandListElement;
		mockHeight(el);
		const data = [makeCommand('showText'), makeCommand('showChoices')];
		el.write(data);
		expect(el.read()).toBe(data);
		expect(el.elements.count).toBeGreaterThan(0);
		const items = Array.from(el.querySelectorAll('.command-item'));
		expect(items.length).toBeGreaterThan(0);
		expect(el.textContent).toContain('showText');
	});

	it('select highlights items', () => {
		const el = createCommandListElement(makeOptions()) as CommandListElement;
		mockHeight(el);
		el.write([makeCommand('a'), makeCommand('b'), makeCommand('c')]);
		el.focusing = true;
		el.select(1);
		expect(el.start).toBe(1);
		const items = Array.from(el.querySelectorAll('.command-item'));
		expect(items[1].classList.contains('selected')).toBe(true);
	});

	it('delete removes commands and saves history', () => {
		const el = createCommandListElement(makeOptions()) as CommandListElement;
		mockHeight(el);
		const data = [makeCommand('a'), makeCommand('b'), makeCommand('c')];
		el.write(data);
		el.focus();
		el.select(1);
		el.delete();
		expect(data.map((d) => d.id)).toEqual(['a', 'c']);
		expect(el.history.canUndo()).toBe(true);
	});

	it('undo restores deleted commands', () => {
		const el = createCommandListElement(makeOptions()) as CommandListElement;
		mockHeight(el);
		const data = [makeCommand('a'), makeCommand('b')];
		el.write(data);
		el.focus();
		el.select(1);
		el.delete();
		el.undo();
		expect(data.map((d) => d.id)).toEqual(['a', 'b']);
	});

	it('copy writes to clipboard', () => {
		const clipboard = { write: vi.fn(), read: () => [], has: () => false };
		const el = createCommandListElement(makeOptions({ clipboard })) as CommandListElement;
		const data = [makeCommand('a'), makeCommand('b')];
		el.write(data);
		el.focus();
		el.select(0, 1);
		el.copy();
		expect(clipboard.write).toHaveBeenCalledWith('yami.commands', data);
	});

	it('paste inserts clipboard commands', () => {
		const pasted = [makeCommand('pasted')];
		const clipboard = { write: vi.fn(), read: () => pasted, has: () => true };
		const el = createCommandListElement(makeOptions({ clipboard })) as CommandListElement;
		mockHeight(el);
		const data = [makeCommand('a')];
		el.write(data);
		el.focus();
		el.select(0);
		el.paste();
		expect(data.map((d) => d.id)).toEqual(['pasted', 'a']);
	});

	it('toggle disables commands', () => {
		const el = createCommandListElement(makeOptions()) as CommandListElement;
		mockHeight(el);
		const data = [makeCommand('a'), makeCommand('b')];
		el.write(data);
		el.focus();
		el.select(0, 1);
		el.toggle();
		expect(data.map((d) => d.id)).toEqual(['!a', '!b']);
	});

	it('save replaces command at selection', () => {
		const el = createCommandListElement(makeOptions()) as CommandListElement;
		mockHeight(el);
		const data = [makeCommand('a'), makeCommand('b')];
		el.write(data);
		el.focus();
		el.select(1);
		el.save(makeCommand('replaced'));
		expect(data.map((d) => d.id)).toEqual(['a', 'replaced']);
	});

	it('clear resets data and elements', () => {
		const el = createCommandListElement(makeOptions()) as CommandListElement;
		el.write([makeCommand('a')]);
		el.clear();
		expect(el.read()).toBe(null);
		expect(el.elements.count).toBe(0);
	});
});
