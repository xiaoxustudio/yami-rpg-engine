import { $, getElementReader, getElementWriter } from '@/util/dom.ts';
import { Window } from '@/tools/window-object.ts';
import { getFocus } from '@/util/element-utils';
import { Command } from '@/command/command-object.ts';
import { IfCondition } from '@/command/conditional-condition-window.ts';
import { Inspector } from '@/inspector/inspector.ts';
import { IListInterface } from '@/types/list-interface.ts';
import { IEditableHistory } from '@/types/history.ts';
import type { History } from '@/tools/history.ts';
import { Local } from './localization.ts';

interface ConditionData {
	type: string;
	key?: string;
	operation?: string;
	value?: string | number | boolean;
}

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
			this.history = new Inspector.ParamHistory!(
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
				return Local.get!('variable.self');
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
			const element = item.element;
			const list = element?.parentNode;
			if (list instanceof HTMLElement && list.classList.contains('tree-list')) {
				(list as HTMLElement & { update: () => void }).update();
			}
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
		const write = getElementWriter('condition');
		let booleanOperation: string | undefined = 'equal';
		let booleanValue: string | number | boolean | undefined = true;
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
		write('type', condition.type);
		write('key', condition.key ?? '');
		write('boolean-operation', booleanOperation);
		write('boolean-value', booleanValue);
		write('number-operation', numberOperation);
		write('number-value', numberValue);
		write('string-operation', stringOperation);
		write('string-value', stringValue);
		getFocus($('#condition-type'));
	}

	save() {
		const read = getElementReader('condition');
		const type = read('type');
		const [varScope, varType] = type.split('-');
		let key;
		let operation;
		let value;
		let condition;
		switch (varScope) {
			case 'global':
				key = read('key');
				if (key === '') {
					return getFocus($('#condition-key'));
				}
				break;
		}
		switch (varType) {
			case 'boolean':
				operation = read('boolean-operation');
				value = read('boolean-value');
				break;
			case 'number':
				operation = read('number-operation');
				value = read('number-value');
				break;
			case 'string':
				operation = read('string-operation');
				value = read('string-value');
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
				$('#condition-key').filter = type.slice(7);
				break;
		}
	}

	static initialize() {
		const typeEl = $('#condition-type');
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
					$('#condition-key'),
					$('#condition-boolean-operation'),
					$('#condition-boolean-value')
				]
			},
			{
				case: 'global-number',
				targets: [
					$('#condition-key'),
					$('#condition-number-operation'),
					$('#condition-number-value')
				]
			},
			{
				case: 'global-string',
				targets: [
					$('#condition-key'),
					$('#condition-string-operation'),
					$('#condition-string-value')
				]
			},
			{
				case: 'self-boolean',
				targets: [$('#condition-boolean-operation'), $('#condition-boolean-value')]
			},
			{
				case: 'self-number',
				targets: [$('#condition-number-operation'), $('#condition-number-value')]
			},
			{
				case: 'self-string',
				targets: [$('#condition-string-operation'), $('#condition-string-value')]
			}
		]);

		$('#condition-boolean-operation').loadItems([
			{ name: '==', value: 'equal' },
			{ name: '!=', value: 'unequal' }
		]);

		$('#condition-boolean-value').loadItems([
			{ name: 'False', value: false },
			{ name: 'True', value: true }
		]);

		$('#condition-number-operation').loadItems([
			{ name: '==', value: 'equal' },
			{ name: '!=', value: 'unequal' },
			{ name: '>=', value: 'greater-or-equal' },
			{ name: '<=', value: 'less-or-equal' },
			{ name: '>', value: 'greater' },
			{ name: '<', value: 'less' }
		]);

		$('#condition-string-operation').loadItems([
			{ name: '==', value: 'equal' },
			{ name: '!=', value: 'unequal' }
		]);

		// 确定按钮 - 鼠标点击事件
	}
}
