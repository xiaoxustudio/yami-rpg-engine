import { describe, expect, it } from 'vitest';
import { createNumberVarElement } from '../number-var-api';
import { elementDataOf } from '../../../../utils/element-data';
import { createCustomBoxElement } from '../../../business/YMCustomBox/custom-box-api';
import { createNumberBoxElement } from '../../YMNumberBox/number-box-api';
import { createSelectVarElement } from '../../YMSelectVar/select-var-api';
import type { SelectVarApi } from '../../YMSelectVar/select-var-api';
import { createStringVarElement } from '../../YMStringVar/string-var-api';
import type { StringVarApi } from '../../YMStringVar/string-var-api';
import { createKeyboardBoxElement } from '../../YMKeyboardBox/keyboard-box-api';
import type { KeyboardBoxApi } from '../../YMKeyboardBox/keyboard-box-api';
import type { SelectBoxApi, SelectItem } from '../../YMSelectBox/select-box-api';
import type { TextBoxApi } from '../../YMTextBox/text-box-api';
import type { NumberVarApi } from '../number-var-api';

const customBoxFactory = () => createCustomBoxElement();
const numberBoxFactory = (dom?: HTMLElement | null) =>
	createNumberBoxElement({ dom, min: '-100', max: '100' });

describe('createNumberVarElement', () => {
	it('writes constant number and reads back', () => {
		const el = createNumberVarElement({
			customBoxFactory,
			numberBoxFactory
		}) as unknown as NumberVarApi;
		el.write(42);
		expect(elementDataOf<NumberVarApi>(el).mode).toBe('constant');
		expect(el.read()).toBe(42);
	});

	it('writes variable object and switches mode', () => {
		const el = createNumberVarElement({
			customBoxFactory,
			numberBoxFactory
		}) as unknown as NumberVarApi;
		const v = { type: 'local', key: 'x' };
		el.write(v);
		expect(elementDataOf<NumberVarApi>(el).mode).toBe('variable');
		expect(el.read()).toEqual(v);
	});

	it('Slash keydown switches mode', () => {
		const el = createNumberVarElement({
			customBoxFactory,
			numberBoxFactory
		}) as unknown as NumberVarApi;
		el.write(1);
		el.dispatchEvent(
			new KeyboardEvent('keydown', { code: 'Slash', bubbles: true, cancelable: true })
		);
		expect(elementDataOf<NumberVarApi>(el).mode).toBe('variable');
	});
});

describe('createSelectVarElement', () => {
	it('writes constant and reads back', () => {
		const sb = createSelectVarElement({
			customBoxFactory,
			selectBoxFactory: (): SelectBoxApi => {
				const el = document.createElement('div') as unknown as SelectBoxApi;
				const data = elementDataOf<SelectBoxApi>(el);
				el.classList.add('select-box');
				data.dataValue = null;
				data.dataItems = [];
				el.read = () => data.dataValue;
				el.write = (v: unknown) => {
					data.dataValue = v;
				};
				el.writeDefault = () => {};
				el.enable = () => {};
				el.disable = () => {};
				el.loadItems = (items: unknown) => {
					data.dataItems = items as SelectItem[];
				};
				el.clear = () => {};
				(el as unknown as { focus: () => void }).focus = () => {};
				return el;
			}
		}) as unknown as SelectVarApi;
		sb.write('a');
		expect(sb.read()).toBe('a');
	});
});

describe('createStringVarElement', () => {
	it('writes constant string', () => {
		const el = createStringVarElement({
			customBoxFactory,
			textBoxFactory: (): TextBoxApi => {
				const el = document.createElement('div') as unknown as TextBoxApi;
				el.classList.add('text-box');
				const input = document.createElement('input');
				el.appendChild(input);
				el.input = input;
				el.read = () => input.value;
				el.write = (v: string) => {
					input.value = v;
				};
				el.enable = () => {};
				el.disable = () => {};
				el.getFocus = () => {};
				return el;
			}
		}) as unknown as StringVarApi;
		el.write('hello');
		expect(el.read()).toBe('hello');
		expect(elementDataOf<StringVarApi>(el).mode).toBe('constant');
	});
});

describe('createKeyboardBoxElement', () => {
	it('write/read/inputCode', () => {
		const el = createKeyboardBoxElement() as unknown as KeyboardBoxApi;
		el.write(65);
		expect(el.read()).toBe(65);
		expect(el.input!.value).toBe('65');
		el.inputCode(75);
		expect(el.read()).toBe(75);
	});
});
