import { elementDataOf } from '../../../../utils/element-data';
import { describe, expect, it } from 'vitest';
import { createSelectBoxElement } from '../select-box-api';
import type { SelectBoxApi } from '../select-box-api';
import { readPayload } from '../../../../utils/payload-event';

describe('createSelectBoxElement', () => {
	it('creates a select-box element with api attached', () => {
		const el = createSelectBoxElement() as unknown as SelectBoxApi;
		expect(el.classList.contains('select-box')).toBe(true);
		expect(typeof el.loadItems).toBe('function');
		expect(typeof el.read).toBe('function');
		expect(typeof el.write).toBe('function');
		expect(typeof el.writeDefault).toBe('function');
		expect(typeof el.enable).toBe('function');
		expect(typeof el.disable).toBe('function');
		expect(typeof el.on).toBe('function');
		expect(elementDataOf<{ info: HTMLElement }>(el).info).toBeTruthy();
	});

	it('loadItems + write + read roundtrip with names', () => {
		const el = createSelectBoxElement() as unknown as SelectBoxApi;
		el.loadItems([
			{ name: 'False', value: false },
			{ name: 'True', value: true }
		]);
		el.write(true);
		expect(el.read()).toBe(true);
		expect(elementDataOf<{ info: HTMLElement }>(el).info.textContent).toBe('True');
	});

	it('write2 falls back to first item when value unknown', () => {
		const el = createSelectBoxElement() as unknown as SelectBoxApi;
		el.loadItems([
			{ name: 'A', value: 'a' },
			{ name: 'B', value: 'b' }
		]);
		el.write2('unknown');
		expect(el.read()).toBe('a');
	});

	it('enableHiddenMode returns element for chaining', () => {
		const el = createSelectBoxElement() as unknown as SelectBoxApi;
		const result = el.enableHiddenMode();
		expect(result).toBe(el);
	});

	it('relate + enableHiddenMode toggles sibling .text labels and targets across writes', () => {
		const el = createSelectBoxElement() as unknown as SelectBoxApi;
		el.loadItems([
			{ name: 'A', value: 'a' },
			{ name: 'B', value: 'b' }
		]);
		el.write('a');
		const container = document.createElement('div');
		const makeLabel = () => {
			const label = document.createElement('div');
			label.className = 'text';
			return label;
		};
		const labelA = makeLabel();
		const targetA = document.createElement('div');
		const labelB = makeLabel();
		const targetB = document.createElement('div');
		const plain = document.createElement('div');
		const targetC = document.createElement('div');
		container.append(labelA, document.createTextNode(' '), targetA);
		container.append(labelB, document.createTextNode(' '), targetB);
		container.append(plain, targetC);
		document.body.appendChild(container);
		el.enableHiddenMode();
		el.relate([
			{ case: 'a', targets: [targetA] },
			{ case: 'b', targets: [targetB] },
			{ case: 'c', targets: [targetC] }
		]);
		el.write('a');
		expect(targetA.style.display).not.toBe('none');
		expect(labelA.style.display).not.toBe('none');
		expect(targetB.style.display).toBe('none');
		expect(labelB.style.display).toBe('none');
		expect(targetC.style.display).toBe('none');
		expect(plain.style.display).not.toBe('none');
		el.write('b');
		expect(targetB.style.display).not.toBe('none');
		expect(labelB.style.display).not.toBe('none');
		expect(targetA.style.display).toBe('none');
		expect(labelA.style.display).toBe('none');
		el.disable();
		expect(targetA.style.display).toBe('none');
		expect(labelA.style.display).toBe('none');
		expect(targetB.style.display).toBe('none');
		expect(labelB.style.display).toBe('none');
		expect(elementDataOf<{ info: HTMLElement }>(el).info.style.display).toBe('none');
		el.enable();
		expect(targetB.style.display).not.toBe('none');
		expect(labelB.style.display).not.toBe('none');
		expect(targetA.style.display).toBe('none');
		expect(labelA.style.display).toBe('none');
		expect(elementDataOf<{ info: HTMLElement }>(el).info.style.display).not.toBe('none');
		container.remove();
	});

	it('relate array case matches multiple values and keeps shared targets enabled', () => {
		const el = createSelectBoxElement() as unknown as SelectBoxApi;
		el.loadItems([
			{ name: 'A', value: 'a' },
			{ name: 'B', value: 'b' }
		]);
		el.write('a');
		const targetA = document.createElement('div');
		const targetB = document.createElement('div');
		const shared = document.createElement('div');
		el.enableHiddenMode();
		el.relate([
			{ case: 'a', targets: [targetA, shared] },
			{ case: ['b', 'c'], targets: [targetB, shared] }
		]);
		el.write('a');
		expect(targetA.style.display).not.toBe('none');
		expect(shared.style.display).not.toBe('none');
		expect(targetB.style.display).toBe('none');
		el.write('b');
		expect(targetB.style.display).not.toBe('none');
		expect(shared.style.display).not.toBe('none');
		expect(targetA.style.display).toBe('none');
		el.write('c');
		expect(targetB.style.display).not.toBe('none');
		expect(shared.style.display).not.toBe('none');
		expect(targetA.style.display).toBe('none');
	});

	it('input dispatches input event with last/value and bubbling change only on change', () => {
		const el = createSelectBoxElement() as unknown as SelectBoxApi;
		el.loadItems([
			{ name: 'A', value: 'a' },
			{ name: 'B', value: 'b' }
		]);
		el.write('a');
		const container = document.createElement('div');
		container.appendChild(el);
		document.body.appendChild(container);
		const inputEvents: Array<{ last: unknown; value: unknown }> = [];
		let changeCount = 0;
		el.on('input', (event: Event) => {
			const e = readPayload<{ last?: unknown; value?: unknown }>(event);
			inputEvents.push({ last: e.last, value: e.value });
		});
		container.addEventListener('change', () => {
			changeCount += 1;
		});
		el.input('b');
		expect(inputEvents).toEqual([{ last: 'a', value: 'b' }]);
		expect(changeCount).toBe(1);
		el.input('b');
		expect(inputEvents).toHaveLength(1);
		expect(changeCount).toBe(1);
		container.remove();
	});

	it('write event carries written value', () => {
		const el = createSelectBoxElement() as unknown as SelectBoxApi;
		el.loadItems([{ name: 'A', value: 'a' }]);
		const values: unknown[] = [];
		el.on('write', (event: Event) => {
			values.push(readPayload<{ value?: unknown }>(event).value);
		});
		el.write('a');
		expect(values).toEqual(['a']);
	});

	it('reselect clamps at boundaries and jumps to first/last when value missing', () => {
		const el = createSelectBoxElement() as unknown as SelectBoxApi;
		el.loadItems([
			{ name: 'A', value: 'a' },
			{ name: 'B', value: 'b' },
			{ name: 'C', value: 'c' }
		]);
		el.write('a');
		el.reselect(-1);
		expect(el.read()).toBe('a');
		el.reselect(1);
		expect(el.read()).toBe('b');
		el.reselect(1);
		expect(el.read()).toBe('c');
		el.reselect(1);
		expect(el.read()).toBe('c');
		el.write('zzz');
		el.reselect(1);
		expect(el.read()).toBe('a');
		el.write('zzz');
		el.reselect(-1);
		expect(el.read()).toBe('c');
	});

	it('write unknown value marks invalid and recovers on valid write', () => {
		const el = createSelectBoxElement() as unknown as SelectBoxApi;
		el.loadItems([{ name: 'A', value: 'a' }]);
		el.write('nope');
		expect(elementDataOf<{ invalid?: boolean }>(el).invalid).toBe(true);
		expect(elementDataOf<{ info: HTMLElement }>(el).info.classList.contains('invalid')).toBe(
			true
		);
		expect(elementDataOf<{ info: HTMLElement }>(el).info.textContent).toBe('nope');
		el.write('a');
		expect(elementDataOf<{ invalid?: boolean }>(el).invalid).toBe(false);
		expect(elementDataOf<{ info: HTMLElement }>(el).info.classList.contains('invalid')).toBe(
			false
		);
		expect(elementDataOf<{ info: HTMLElement }>(el).info.textContent).toBe('A');
	});

	it('save/restore roundtrip restores saved value exactly once', () => {
		const el = createSelectBoxElement() as unknown as SelectBoxApi;
		el.loadItems([
			{ name: 'A', value: 'a' },
			{ name: 'B', value: 'b' }
		]);
		el.write('a');
		el.save();
		el.write('b');
		expect(el.read()).toBe('b');
		el.restore();
		expect(el.read()).toBe('a');
		el.restore();
		expect(el.read()).toBe('a');
	});
});
