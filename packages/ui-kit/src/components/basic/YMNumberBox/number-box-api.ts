import { elementDataOf, isApiAttached, markApiAttached } from '../../../utils/element-data';
import { attachApi } from '../../../utils/attach-api';
import { addClass } from '../../../utils/dom';
import { NumberHistory } from '../../../utils/history';
import { createNumberBoxCore } from './number-box-core';

export interface NumberBoxApiOptions {
	dom?: HTMLElement | null;
	min?: string;
	max?: string;
	step?: string;
	unit?: string | null;
	decimals?: number;
	modelValue?: string | number;
	disabled?: boolean;
	measureText?: ((text: string, font?: string) => { width: number }) | null;
}

export interface NumberBoxApi extends HTMLElement {
	input?: HTMLInputElement;
	focusEventEnabled: boolean;
	blurEventEnabled: boolean;
	read(...args: unknown[]): number;
	write(...args: unknown[]): void;
	enable(...args: unknown[]): void;
	disable(...args: unknown[]): void;
	getFocus(mode?: string): void;
	on(...args: unknown[]): void;
}

/**
 * P4b：数字框工厂的"小数位"走**显式元素数据**（`decimals` 已从 DATA_FIELDS 摘除）。
 * 注意 SFC（`YMNumberBox.vue`）自己 `defineProperty(el, 'decimals', …)` 定义了一个同名实例属性，
 * 那是组件内部状态、与本字段无关——两者不会互相遮蔽（实例属性优先于原型访问器）。
 */
interface NumberBoxData {
	decimals: number;
}

/**
 * 带历史记录的内部 input 元素（attachNumberBoxApi 在挂载时把它装到 input 上）。
 *
 * 导出以便**消费方**不必各自写 as unknown as { history: unknown } —— 编辑器侧 3 个
 * components/common/*.vue 曾各写一遍同形断言（2026-09-21 第 89 轮）。
 */
export interface HistoryInputElement extends HTMLInputElement {
	history: { reset(): void };
}

export function attachNumberBoxApi(
	el: HTMLElement,
	options: NumberBoxApiOptions = {}
): NumberBoxApi {
	const box = el as NumberBoxApi;
	if (isApiAttached(box)) return box;
	// P4b：`decimals` 走显式元素数据（字段已从 DATA_FIELDS 摘除）
	const data = elementDataOf<NumberBoxData>(box);

	const input = document.createElement('input');
	addClass(input, 'number-box-input');
	input.type = 'number';
	input.min = '0';
	input.max = '0';
	input.step = '1';
	input.title = '';
	(input as HistoryInputElement).history = new NumberHistory(input);

	box.focusEventEnabled = false;
	box.blurEventEnabled = false;

	const core = createNumberBoxCore(
		{
			getRoot: () => el,
			getInput: () => input
		},
		box
	);
	const { inputKeydown, readValue, enable, disable, getFocus, on } = core;

	input.addEventListener('keydown', inputKeydown);
	input.addEventListener('change', () => {
		input.value = String(readValue(data.decimals));
	});

	const src = options.dom instanceof HTMLElement ? options.dom : el;
	const min = options.min ?? src.getAttribute('min') ?? '0';
	const max = options.max ?? src.getAttribute('max') ?? '0';
	const step = options.step ?? src.getAttribute('step') ?? '1';
	const unit = options.unit !== undefined ? options.unit : src.getAttribute('unit');
	const decimals = options.decimals ?? (parseInt(src.getAttribute('decimals') ?? '') || 0);

	input.min = min;
	input.max = max;
	input.step = step;

	box.input = input;
	data.decimals = decimals;
	// P4b：`box._unit = unit` 已删除——该字段只写不读（等价死状态），随 DATA_FIELDS 一并退役

	el.appendChild(input);

	const measure = options.measureText ?? null;
	if (el.childNodes.length > 1) {
		const label = el.childNodes[0]?.textContent ?? '';
		const font = 'var(--ym-font-mono)';
		const padding = (measure ? measure(label, font).width : label.length * 8) + 8;
		input.style.paddingLeft = `${padding}px`;
	}

	if (unit !== null) {
		const unitText = document.createElement('div');
		const font = 'var(--ym-font-mono)';
		const padding = (measure ? measure(unit, font).width : unit.length * 8) + 8;
		addClass(unitText, 'unit');
		addClass(unitText, 'text');
		unitText.textContent = unit;
		el.insertBefore(unitText, input);
		input.style.paddingRight = `${padding}px`;
	}

	const read = (): number => readValue(data.decimals);

	const write = (value: string | number): void => {
		core.write(value, data.decimals);
	};

	attachApi<NumberBoxApi>(box, { read, write, enable, disable, getFocus, on });

	markApiAttached(box);

	if (options.modelValue !== undefined && options.modelValue !== null) {
		box.write(options.modelValue);
	}
	if (options.disabled) {
		box.disable();
	}

	return box;
}

export function createNumberBoxElement(options?: NumberBoxApiOptions): NumberBoxApi {
	const el = document.createElement('div');
	el.className = 'number-box';
	return attachNumberBoxApi(el, options);
}
