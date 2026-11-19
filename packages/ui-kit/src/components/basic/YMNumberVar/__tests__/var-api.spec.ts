import { describe, expect, it } from 'vitest';
import { createNumberVarElement } from '../number-var-api';
import { elementDataOf } from '../../../../utils/element-data';
import { getElementApi, setElementApi } from '../../../../utils/element-apis';
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
		const api = getElementApi<NumberVarApi>(el)!;
		api.write(42);
		expect(elementDataOf<NumberVarApi>(el).mode).toBe('constant');
		expect(api.read()).toBe(42);
	});

	it('writes variable object and switches mode', () => {
		const el = createNumberVarElement({
			customBoxFactory,
			numberBoxFactory
		}) as unknown as NumberVarApi;
		const api = getElementApi<NumberVarApi>(el)!;
		const v = { type: 'local', key: 'x' };
		api.write(v);
		expect(elementDataOf<NumberVarApi>(el).mode).toBe('variable');
		expect(api.read()).toEqual(v);
	});

	it('Slash keydown switches mode', () => {
		const el = createNumberVarElement({
			customBoxFactory,
			numberBoxFactory
		}) as unknown as NumberVarApi;
		const api = getElementApi<NumberVarApi>(el)!;
		api.write(1);
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
				// 夹具也按新契约把能力放进旁表（元素上不挂方法）
				setElementApi(el, {
					read: () => data.dataValue,
					write: (v: unknown) => {
						data.dataValue = v;
					},
					writeDefault: () => {},
					enable: () => {},
					disable: () => {},
					loadItems: (items: unknown) => {
						data.dataItems = items as SelectItem[];
					},
					clear: () => {}
				});
				(el as unknown as { focus: () => void }).focus = () => {};
				return el;
			}
		}) as unknown as SelectVarApi;
		const api = getElementApi<SelectVarApi>(sb)!;
		api.write('a');
		expect(api.read()).toBe('a');
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
				setElementApi(el, {
					read: () => input.value,
					write: (v: string) => {
						input.value = v;
					},
					enable: () => {},
					disable: () => {},
					getFocus: () => {}
				});
				return el;
			}
		}) as unknown as StringVarApi;
		const api = getElementApi<StringVarApi>(el)!;
		api.write('hello');
		expect(api.read()).toBe('hello');
		expect(elementDataOf<StringVarApi>(el).mode).toBe('constant');
	});
});

describe('createKeyboardBoxElement', () => {
	it('write/read/inputCode', () => {
		const el = createKeyboardBoxElement() as unknown as KeyboardBoxApi;
		const api = getElementApi<KeyboardBoxApi>(el)!;
		api.write(65);
		expect(api.read()).toBe(65);
		expect(el.input!.value).toBe('65');
		api.inputCode(75);
		expect(api.read()).toBe(75);
	});
});
