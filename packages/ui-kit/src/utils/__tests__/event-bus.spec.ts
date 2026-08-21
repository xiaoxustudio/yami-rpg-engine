import { describe, expect, it, vi, beforeEach } from 'vitest';
import { EventBus } from '../event-bus';

describe('EventBus', () => {
	beforeEach(() => {
		EventBus.clear();
	});

	it('subscribes and emits to a callback', () => {
		const spy = vi.fn();
		EventBus.on('test', spy);
		EventBus.emit('test', 42);
		expect(spy).toHaveBeenCalledWith(42);
	});

	it('returns an unsubscribe function from on', () => {
		const spy = vi.fn();
		const off = EventBus.on('test', spy);
		off();
		EventBus.emit('test', 1);
		expect(spy).not.toHaveBeenCalled();
	});

	it('removes a callback via off', () => {
		const spy = vi.fn();
		EventBus.on('test', spy);
		EventBus.off('test', spy);
		EventBus.emit('test', 1);
		expect(spy).not.toHaveBeenCalled();
	});

	it('supports once semantics', () => {
		const spy = vi.fn();
		EventBus.once('test', spy);
		EventBus.emit('test', 1);
		EventBus.emit('test', 2);
		expect(spy).toHaveBeenCalledTimes(1);
	});

	it('isolates events by name', () => {
		const a = vi.fn();
		const b = vi.fn();
		EventBus.on('a', a);
		EventBus.on('b', b);
		EventBus.emit('a', 1);
		expect(a).toHaveBeenCalledTimes(1);
		expect(b).not.toHaveBeenCalled();
	});

	it('does not emit when no listeners registered', () => {
		expect(() => EventBus.emit('missing', 1)).not.toThrow();
	});

	it('clears all listeners', () => {
		const spy = vi.fn();
		EventBus.on('test', spy);
		EventBus.clear();
		EventBus.emit('test', 1);
		expect(spy).not.toHaveBeenCalled();
	});
});
