import { reactive } from 'vue';
import { createElementRegistry } from '@app/utils/element-registry';
import { treeOwnerListOf, type CustomBoxApi } from '@ui-kit';
import { Window } from '@app/tools/window-object.ts';
import { Command } from '@app/commands/command-object.ts';
import { requestFocus } from '@app/directives/focus';
import { useIfConditionSchema } from '@app/composables/useIfConditionSchema';

const IfCondition = useIfConditionSchema();
import { ParamHistory } from '@app/composables/useParamHistory';
import { IListInterface } from '@app/types/list-interface.ts';
import { IEditableHistory } from '@app/types/history.ts';
import type { History } from '@app/tools/history.ts';
import { getYamiI18n } from '@app/i18n';
import { applyLocalizedItems } from '@app/utils/localized-items';

/** P5b 批次 3：元素注册表——由对应窗口 SFC 在模板里登记 */
export const conditionEls = createElementRegistry();

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});

interface ConditionData {
	type: string;
	key?: string;
	operation?: string;
	value?: string | number | boolean;
}

export interface ConditionForm {
	type: string;
	key: string;
	booleanOperation: string | undefined;
	booleanValue: boolean;
	numberOperation: string | undefined;
	numberValue: number;
	stringOperation: string | undefined;
	stringValue: string;
}

export const form = reactive<ConditionForm>({
	type: 'global-boolean',
	key: '',
	booleanOperation: 'equal',
	booleanValue: true,
	numberOperation: 'equal',
	numberValue: 0,
	stringOperation: 'equal',
	stringValue: ''
});

export class ConditionListInterface implements IListInterface {
	target!: HTMLElement | null;
	type!: string;
	history!: IEditableHistory | null;
	editor!: { target?: unknown } | null;
	owner!: { history?: unknown } | null;

	constructor(editor?: unknown, owner?: unknown) {
		this.editor = (editor as { target?: unknown } | null) ?? null;
		this.owner = (owner as { history?: unknown } | null) ?? null;
	}

	initialize(list: HTMLElement): void {
		this.target = null;
		this.type = 'condition';

		const { editor, owner } = this;
		if (editor && owner) {
			this.history = new ParamHistory(
				editor as { target: unknown },
				owner as { history: History },
				list
			) as unknown as IEditableHistory;
		}
	}

	parseVariable(condition: ConditionData): string | undefined {
		switch (condition.type) {
			case 'global-boolean':
			case 'global-number':
			case 'global-string':
				return Command.parseGlobalVariable!(condition.key);
			case 'self-boolean':
			case 'self-number':
			case 'self-string':
				return t('variable.self');
		}
	}

	parse(condition: ConditionData) {
		const variable = this.parseVariable!(condition);
		switch (condition.type) {
			case 'global-boolean':
			case 'self-boolean': {
				const operator = Command.removeTextTags!(
					IfCondition.parseBooleanOperation!(condition)
				);
				const value = condition.value!.toString();
				return `${variable} ${operator} ${value}`;
			}
			case 'global-number':
			case 'self-number': {
				const operator = Command.removeTextTags!(
					IfCondition.parseNumberOperation!(condition)
				);
				const value = condition.value!.toString();
				return `${variable} ${operator} ${value}`;
			}
			case 'global-string':
			case 'self-string': {
				const operator = Command.removeTextTags!(
					IfCondition.parseStringOperation!(condition)
				);
				const value = `"${Command.parseMultiLineString!(condition.value)}"`;
				return `${variable} ${operator} ${value}`;
			}
		}
	}

	update(list: HTMLElement) {
		const item = this.editor?.target as {
			conditions?: unknown;
			element?: { parentNode?: Node };
		};
		if (item?.conditions === list.read()) {
			// 步骤 4：按 item 反查所属列表（不再依赖 element.parentNode）
			const owner = treeOwnerListOf(item as never) as { update?: () => void } | undefined;
			owner?.update?.();
		}
	}

	open(
		condition: ConditionData = {
			type: 'global-boolean',
			key: '',
			operation: 'equal',
			value: true
		}
	) {
		Window.open!('condition');
		ConditionListInterface.target = this.target;
		let booleanOperation: string | undefined = 'equal';
		let booleanValue = true;
		let numberOperation: string | undefined = 'equal';
		let numberValue = 0;
		let stringOperation: string | undefined = 'equal';
		let stringValue = '';
		switch (condition.type) {
			case 'global-boolean':
			case 'self-boolean':
				booleanOperation = condition.operation!;
				booleanValue = condition.value as boolean;
				break;
			case 'global-number':
			case 'self-number':
				numberOperation = condition.operation!;
				numberValue = condition.value as number;
				break;
			case 'global-string':
			case 'self-string':
				stringOperation = condition.operation!;
				stringValue = condition.value as string;
				break;
		}
		Object.assign(form, {
			type: condition.type,
			key: condition.key ?? '',
			booleanOperation,
			booleanValue,
			numberOperation,
			numberValue,
			stringOperation,
			stringValue
		});
		requestFocus('condition-type');
	}

	save() {
		const type = form.type;
		const [varScope, varType] = type.split('-');
		let key;
		let operation;
		let value;
		let condition;
		switch (varScope) {
			case 'global':
				key = form.key;
				if (key === '') {
					return requestFocus('condition-key');
				}
				break;
		}
		switch (varType) {
			case 'boolean':
				operation = form.booleanOperation;
				value = form.booleanValue;
				break;
			case 'number':
				operation = form.numberOperation;
				value = form.numberValue;
				break;
			case 'string':
				operation = form.stringOperation;
				value = form.stringValue;
				break;
		}
		switch (varScope) {
			case 'global':
				condition = { type, key, operation, value };
				break;
			case 'self':
				condition = { type, operation, value };
				break;
		}
		Window.close!('condition');
		return condition;
	}

	static target: HTMLElement | null = null;

	static typeWrite(event: Event & { value: string }) {
		const type = event.value;
		switch (type) {
			case 'global-boolean':
			case 'global-number':
			case 'global-string':
				const keyEl = conditionEls.get('condition-key');
				// P4c：`filter` 是 CustomBox 的实例属性（见 `custom-box-api.ts`），类型来自 `CustomBoxApi`
				if (keyEl) (keyEl as CustomBoxApi).filter = type.slice(7);
				break;
		}
	}

	static initialize() {
		const typeEl = conditionEls.get('condition-type');
		if (!typeEl) return;
		typeEl.loadItems([
			{ name: 'Global - Boolean', value: 'global-boolean' },
			{ name: 'Global - Number', value: 'global-number' },
			{ name: 'Global - String', value: 'global-string' },
			{ name: 'Self - Boolean', value: 'self-boolean' },
			{ name: 'Self - Number', value: 'self-number' },
			{ name: 'Self - String', value: 'self-string' }
		]);

		typeEl.enableHiddenMode().relate([
			{
				case: 'global-boolean',
				targets: [
					conditionEls.get('condition-key'),
					conditionEls.get('condition-boolean-operation'),
					conditionEls.get('condition-boolean-value')
				]
			},
			{
				case: 'global-number',
				targets: [
					conditionEls.get('condition-key'),
					conditionEls.get('condition-number-operation'),
					conditionEls.get('condition-number-value')
				]
			},
			{
				case: 'global-string',
				targets: [
					conditionEls.get('condition-key'),
					conditionEls.get('condition-string-operation'),
					conditionEls.get('condition-string-value')
				]
			},
			{
				case: 'self-boolean',
				targets: [
					conditionEls.get('condition-boolean-operation'),
					conditionEls.get('condition-boolean-value')
				]
			},
			{
				case: 'self-number',
				targets: [
					conditionEls.get('condition-number-operation'),
					conditionEls.get('condition-number-value')
				]
			},
			{
				case: 'self-string',
				targets: [
					conditionEls.get('condition-string-operation'),
					conditionEls.get('condition-string-value')
				]
			}
		]);

		applyLocalizedItems('condition-boolean-operation', ['equal', 'unequal'], (items) =>
			conditionEls.get('condition-boolean-operation')?.loadItems?.(items)
		);

		conditionEls.get('condition-boolean-value')?.loadItems?.([
			{ name: 'False', value: false },
			{ name: 'True', value: true }
		]);

		applyLocalizedItems(
			'condition-number-operation',
			['equal', 'unequal', 'greater-or-equal', 'less-or-equal', 'greater', 'less'],
			(items) => conditionEls.get('condition-number-operation')?.loadItems?.(items)
		);

		applyLocalizedItems('condition-string-operation', ['equal', 'unequal'], (items) =>
			conditionEls.get('condition-string-operation')?.loadItems?.(items)
		);

		// 确定按钮 - 鼠标点击事件
	}
}
