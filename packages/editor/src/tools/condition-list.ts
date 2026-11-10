import { getCondition } from '@app/composables/condition-bridge';
import { reactive } from 'vue';
import { treeOwnerListOf } from '@ui-kit';
import { Window } from '@app/tools/window-object.ts';
import { onToolWindowMounted } from '@app/tools/tool-window-host';
import { Command } from '@app/commands/command-object.ts';
import { requestFocus } from '@app/directives/focus';
import { useIfConditionSchema } from '@app/composables/useIfConditionSchema';

const IfCondition = useIfConditionSchema();
import { ParamHistory } from '@app/composables/useParamHistory';
import { IListInterface } from '@app/types/list-interface.ts';
import { IUndoRedoHistory } from '@app/types/history.ts';
import type { History } from '@app/tools/history.ts';
import { getYamiI18n } from '@app/i18n';
import { applyLocalizedItems } from '@app/utils/localized-items';
import type { YamiElement } from '@app/types/element-api';

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
	history!: IUndoRedoHistory | null;
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
			);
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

	update(list: YamiElement) {
		const item = this.editor?.target as {
			conditions?: unknown;
			element?: { parentNode?: Node };
		};
		if (item?.conditions === list.read()) {
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
				// `filter` 是 CustomBox 的元素能力，这里按它的最小形状断言
				const keyBox = getCondition()?.control('key') as
					| { filter?: string }
					| null
					| undefined;
				if (keyBox) keyBox.filter = type.slice(7);
				break;
		}
	}

	static initialize() {
		const typeEl = getCondition()?.control('type');
		if (!typeEl) {
			// 条件窗口是懒挂载的：首次打开前控件不在注册表，高亮行关系与选项都会丢
			onToolWindowMounted('condition', () => ConditionListInterface.initialize());
			return;
		}
		typeEl.loadItems?.([
			{ name: 'Global - Boolean', value: 'global-boolean' },
			{ name: 'Global - Number', value: 'global-number' },
			{ name: 'Global - String', value: 'global-string' },
			{ name: 'Self - Boolean', value: 'self-boolean' },
			{ name: 'Self - Number', value: 'self-number' },
			{ name: 'Self - String', value: 'self-string' }
		]);

		getCondition()?.relateGroups([
			{
				case: 'global-boolean',
				targets: ['key', 'booleanOperation', 'booleanValue']
			},
			{
				case: 'global-number',
				targets: ['key', 'numberOperation', 'numberValue']
			},
			{
				case: 'global-string',
				targets: ['key', 'stringOperation', 'stringValue']
			},
			{
				case: 'self-boolean',
				targets: ['booleanOperation', 'booleanValue']
			},
			{
				case: 'self-number',
				targets: ['numberOperation', 'numberValue']
			},
			{
				case: 'self-string',
				targets: ['stringOperation', 'stringValue']
			}
		]);

		applyLocalizedItems('condition-boolean-operation', ['equal', 'unequal'], (items) =>
			getCondition()?.control('booleanOperation')?.loadItems?.(items)
		);

		getCondition()
			?.control('booleanValue')
			?.loadItems?.([
				{ name: 'False', value: false },
				{ name: 'True', value: true }
			]);

		applyLocalizedItems(
			'condition-number-operation',
			['equal', 'unequal', 'greater-or-equal', 'less-or-equal', 'greater', 'less'],
			(items) => getCondition()?.control('numberOperation')?.loadItems?.(items)
		);

		applyLocalizedItems('condition-string-operation', ['equal', 'unequal'], (items) =>
			getCondition()?.control('stringOperation')?.loadItems?.(items)
		);
	}
}
