import { describe, expect, it } from 'vitest';
import { createNumberVarElement } from '../number-var-api';
import { createCustomBoxElement } from '../../../business/YMCustomBox/custom-box-api';
import { createNumberBoxElement } from '../../YMNumberBox/number-box-api';
import { createSelectVarElement } from '../../YMSelectVar/select-var-api';
import { createStringVarElement } from '../../YMStringVar/string-var-api';
import { createKeyboardBoxElement } from '../../YMKeyboardBox/keyboard-box-api';

const customBoxFactory = () => createCustomBoxElement();
const numberBoxFactory = (dom?: any) => createNumberBoxElement({ dom, min: '-100', max: '100' });

describe('createNumberVarElement', () => {
	it('writes constant number and reads back', () => {
		const el = createNumberVarElement({ customBoxFactory, numberBoxFactory }) as any;
		el.write(42);
		expect(el.mode).toBe('constant');
		expect(el.read()).toBe(42);
	});

	it('writes variable object and switches mode', () => {
		const el = createNumberVarElement({ customBoxFactory, numberBoxFactory }) as any;
		const v = { type: 'local', key: 'x' };
		el.write(v);
		expect(el.mode).toBe('variable');
		expect(el.read()).toEqual(v);
	});

	it('Slash keydown switches mode', () => {
		const el = createNumberVarElement({ customBoxFactory, numberBoxFactory }) as any;
		el.write(1);
		el.dispatchEvent(
			new KeyboardEvent('keydown', { code: 'Slash', bubbles: true, cancelable: true })
		);
		expect(el.mode).toBe('variable');
	});
});

describe('createSelectVarElement', () => {
	it('writes constant and reads back', () => {
		const sb = createSelectVarElement({
			customBoxFactory,
			selectBoxFactory: (): any => {
				const el: any = document.createElement('div');
				el.classList.add('select-box');
				(el as any).dataValue = null;
				(el as any).dataItems = [];
				(el as any).read = () => (el as any).dataValue;
				(el as any).write = (v: any) => {
					(el as any).dataValue = v;
				};
				(el as any).writeDefault = () => {};
				(el as any).enable = () => {};
				(el as any).disable = () => {};
				(el as any).loadItems = (items: any) => {
					(el as any).dataItems = items;
				};
				(el as any).clear = () => {};
				(el as any).focus = () => {};
				return el;
			}
		}) as any;
		sb.write('a');
		expect(sb.read()).toBe('a');
	});
});

describe('createStringVarElement', () => {
	it('writes constant string', () => {
		const el = createStringVarElement({
			customBoxFactory,
			textBoxFactory: (): any => {
				const el: any = document.createElement('div');
				el.classList.add('text-box');
				const input = document.createElement('input');
				el.appendChild(input);
				(el as any).input = input;
				(el as any).read = () => input.value;
				(el as any).write = (v: string) => {
					input.value = v;
				};
				(el as any).enable = () => {};
				(el as any).disable = () => {};
				(el as any).getFocus = () => {};
				return el;
			}
		}) as any;
		el.write('hello');
		expect(el.read()).toBe('hello');
		expect(el.mode).toBe('constant');
	});
});

describe('createKeyboardBoxElement', () => {
	it('write/read/inputCode', () => {
		const el = createKeyboardBoxElement() as any;
		el.write(65);
		expect(el.read()).toBe(65);
		expect(el.input.value).toBe('65');
		el.inputCode(75);
		expect(el.read()).toBe(75);
	});
});
