import { elementDataOf } from '../../../../utils/element-data';
import { describe, expect, it } from 'vitest';
import { createSelectBoxElement } from '../select-box-api';
import type { SelectBoxApi } from '../select-box-api';
import { readPayload } from '../../../../utils/payload-event';
import { getElementApi } from '../../../../utils/element-apis';

describe('createSelectBoxElement', () => {
	it('creates a select-box element with api attached', () => {
		const el = createSelectBoxElement() as unknown as SelectBoxApi;
		const api = getElementApi<SelectBoxApi>(el)!;
		expect(el.classList.contains('select-box')).toBe(true);
		// 契约锁：能力在旁表里，元素上不再挂方法
		expect(typeof (el as unknown as Record<string, unknown>).read).toBe('undefined');
		expect(typeof api.loadItems).toBe('function');
		expect(typeof api.read).toBe('function');
		expect(typeof api.write).toBe('function');
		expect(typeof api.writeDefault).toBe('function');
		expect(typeof api.enable).toBe('function');
		expect(typeof api.disable).toBe('function');
		expect(typeof api.on).toBe('function');
		expect(elementDataOf<{ info: HTMLElement }>(el).info).toBeTruthy();
	});

	it('loadItems + write + read roundtrip with names', () => {
		const el = createSelectBoxElement() as unknown as SelectBoxApi;
		const api = getElementApi<SelectBoxApi>(el)!;
		api.loadItems([
			{ name: 'False', value: false },
			{ name: 'True', value: true }
		]);
		api.write(true);
		expect(api.read()).toBe(true);
		expect(elementDataOf<{ info: HTMLElement }>(el).info.textContent).toBe('True');
	});

	it('write2 falls back to first item when value unknown', () => {
		const el = createSelectBoxElement() as unknown as SelectBoxApi;
		const api = getElementApi<SelectBoxApi>(el)!;
		api.loadItems([
			{ name: 'A', value: 'a' },
			{ name: 'B', value: 'b' }
		]);
		api.write2('unknown');
		expect(api.read()).toBe('a');
	});

	it('enableHiddenMode returns element for chaining', () => {
		const el = createSelectBoxElement() as unknown as SelectBoxApi;
		const api = getElementApi<SelectBoxApi>(el)!;
		const result = api.enableHiddenMode();
		expect(result).toBe(el);
	});

	it('relate + enableHiddenMode toggles sibling .text labels and targets across writes', () => {
		const el = createSelectBoxElement() as unknown as SelectBoxApi;
		const api = getElementApi<SelectBoxApi>(el)!;
		api.loadItems([
			{ name: 'A', value: 'a' },
			{ name: 'B', value: 'b' }
		]);
		api.write('a');
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
		api.enableHiddenMode();
		api.relate([
			{ case: 'a', targets: [targetA] },
			{ case: 'b', targets: [targetB] },
			{ case: 'c', targets: [targetC] }
		]);
		api.write('a');
		expect(targetA.style.display).not.toBe('none');
		expect(labelA.style.display).not.toBe('none');
		expect(targetB.style.display).toBe('none');
		expect(labelB.style.display).toBe('none');
		expect(targetC.style.display).toBe('none');
		expect(plain.style.display).not.toBe('none');
		api.write('b');
		expect(targetB.style.display).not.toBe('none');
		expect(labelB.style.display).not.toBe('none');
		expect(targetA.style.display).toBe('none');
		expect(labelA.style.display).toBe('none');
		api.disable();
		expect(targetA.style.display).toBe('none');
		expect(labelA.style.display).toBe('none');
		expect(targetB.style.display).toBe('none');
		expect(labelB.style.display).toBe('none');
		expect(elementDataOf<{ info: HTMLElement }>(el).info.style.display).toBe('none');
		api.enable();
		expect(targetB.style.display).not.toBe('none');
		expect(labelB.style.display).not.toBe('none');
		expect(targetA.style.display).toBe('none');
		expect(labelA.style.display).toBe('none');
		expect(elementDataOf<{ info: HTMLElement }>(el).info.style.display).not.toBe('none');
		container.remove();
	});

	it('relate array case matches multiple values and keeps shared targets enabled', () => {
		const el = createSelectBoxElement() as unknown as SelectBoxApi;
		const api = getElementApi<SelectBoxApi>(el)!;
		api.loadItems([
			{ name: 'A', value: 'a' },
			{ name: 'B', value: 'b' }
		]);
		api.write('a');
		const targetA = document.createElement('div');
		const targetB = document.createElement('div');
		const shared = document.createElement('div');
		api.enableHiddenMode();
		api.relate([
			{ case: 'a', targets: [targetA, shared] },
			{ case: ['b', 'c'], targets: [targetB, shared] }
		]);
		api.write('a');
		expect(targetA.style.display).not.toBe('none');
		expect(shared.style.display).not.toBe('none');
		expect(targetB.style.display).toBe('none');
		api.write('b');
		expect(targetB.style.display).not.toBe('none');
		expect(shared.style.display).not.toBe('none');
		expect(targetA.style.display).toBe('none');
		api.write('c');
		expect(targetB.style.display).not.toBe('none');
		expect(shared.style.display).not.toBe('none');
		expect(targetA.style.display).toBe('none');
	});

	it('input dispatches input event with last/value and bubbling change only on change', () => {
		const el = createSelectBoxElement() as unknown as SelectBoxApi;
		const api = getElementApi<SelectBoxApi>(el)!;
		api.loadItems([
			{ name: 'A', value: 'a' },
			{ name: 'B', value: 'b' }
		]);
		api.write('a');
		const container = document.createElement('div');
		container.appendChild(el);
		document.body.appendChild(container);
		const inputEvents: Array<{ last: unknown; value: unknown }> = [];
		let changeCount = 0;
		api.on('input', (event: Event) => {
			const e = readPayload<{ last?: unknown; value?: unknown }>(event);
			inputEvents.push({ last: e.last, value: e.value });
		});
		container.addEventListener('change', () => {
			changeCount += 1;
		});
		api.input('b');
		expect(inputEvents).toEqual([{ last: 'a', value: 'b' }]);
		expect(changeCount).toBe(1);
		api.input('b');
		expect(inputEvents).toHaveLength(1);
		expect(changeCount).toBe(1);
		container.remove();
	});

	it('write event carries written value', () => {
		const el = createSelectBoxElement() as unknown as SelectBoxApi;
		const api = getElementApi<SelectBoxApi>(el)!;
		api.loadItems([{ name: 'A', value: 'a' }]);
		const values: unknown[] = [];
		api.on('write', (event: Event) => {
			values.push(readPayload<{ value?: unknown }>(event).value);
		});
		api.write('a');
		expect(values).toEqual(['a']);
	});

	it('reselect clamps at boundaries and jumps to first/last when value missing', () => {
		const el = createSelectBoxElement() as unknown as SelectBoxApi;
		const api = getElementApi<SelectBoxApi>(el)!;
		api.loadItems([
			{ name: 'A', value: 'a' },
			{ name: 'B', value: 'b' },
			{ name: 'C', value: 'c' }
		]);
		api.write('a');
		api.reselect(-1);
		expect(api.read()).toBe('a');
		api.reselect(1);
		expect(api.read()).toBe('b');
		api.reselect(1);
		expect(api.read()).toBe('c');
		api.reselect(1);
		expect(api.read()).toBe('c');
		api.write('zzz');
		api.reselect(1);
		expect(api.read()).toBe('a');
		api.write('zzz');
		api.reselect(-1);
		expect(api.read()).toBe('c');
	});

	it('write unknown value marks invalid and recovers on valid write', () => {
		const el = createSelectBoxElement() as unknown as SelectBoxApi;
		const api = getElementApi<SelectBoxApi>(el)!;
		api.loadItems([{ name: 'A', value: 'a' }]);
		api.write('nope');
		expect(elementDataOf<{ invalid?: boolean }>(el).invalid).toBe(true);
		expect(elementDataOf<{ info: HTMLElement }>(el).info.classList.contains('invalid')).toBe(
			true
		);
		expect(elementDataOf<{ info: HTMLElement }>(el).info.textContent).toBe('nope');
		api.write('a');
		expect(elementDataOf<{ invalid?: boolean }>(el).invalid).toBe(false);
		expect(elementDataOf<{ info: HTMLElement }>(el).info.classList.contains('invalid')).toBe(
			false
		);
		expect(elementDataOf<{ info: HTMLElement }>(el).info.textContent).toBe('A');
	});

	it('save/restore roundtrip restores saved value exactly once', () => {
		const el = createSelectBoxElement() as unknown as SelectBoxApi;
		const api = getElementApi<SelectBoxApi>(el)!;
		api.loadItems([
			{ name: 'A', value: 'a' },
			{ name: 'B', value: 'b' }
		]);
		api.write('a');
		api.save();
		api.write('b');
		expect(api.read()).toBe('b');
		api.restore();
		expect(api.read()).toBe('a');
		api.restore();
		expect(api.read()).toBe('a');
	});

	it('relate 立即按当前值同步显隐（不再依赖之后的 write）', () => {
		const el = createSelectBoxElement() as unknown as SelectBoxApi;
		const api = getElementApi<SelectBoxApi>(el)!;
		api.loadItems([
			{ name: 'A', value: 'a' },
			{ name: 'B', value: 'b' }
		]);
		// 值先到：v-model 挂载即写 / 表单回填在关系之前
		api.write('a');
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
		container.append(labelA, document.createTextNode(' '), targetA);
		container.append(labelB, document.createTextNode(' '), targetB);
		document.body.appendChild(container);

		api.enableHiddenMode();
		api.relate([
			{ case: 'a', targets: [targetA] },
			{ case: 'b', targets: [targetB] }
		]);
		// 没有再 write：关系建立时就该按 'a' 折叠
		expect(targetA.style.display).not.toBe('none');
		expect(labelA.style.display).not.toBe('none');
		expect(targetB.style.display).toBe('none');
		expect(labelB.style.display).toBe('none');
		container.remove();
	});
});
