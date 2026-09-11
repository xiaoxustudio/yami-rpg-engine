import { Command } from '@app/commands/command-object.ts';
import { Token } from '@app/commands/token.ts';
import { useNumberOperandSchema } from '@app/composables/useNumberOperandSchema';

const NumberOperand = useNumberOperandSchema();
import { CommandSchema } from '@app/commands/schema.ts';
import { getYamiI18n } from '@app/i18n';
import { requestFocus } from '@app/directives/focus';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});
import { VariableGetter } from '@app/commands/accessors/variable-accessor-window.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export interface SetNumberOperand {
	operation: string;
	type: string;
	value?: number;
	property: string;
	data: string;
}

Command.cases.setNumber = new CommandSchema({
	name: 'setNumber',
	fields: [
		{ key: 'variable', default: { type: 'local', key: '' } },
		{ key: 'operation', default: 'set' },
		{
			key: 'operands',
			default: () => [
				{ operation: 'add', type: 'constant', value: 0 } as unknown as SetNumberOperand
			]
		}
	],
	parseOperation(operation: string) {
		switch (operation) {
			case 'set':
				return ' = ';
			case 'add':
				return ' += ';
			case 'sub':
				return ' -= ';
			case 'mul':
				return ' *= ';
			case 'div':
				return ' /= ';
			case 'mod':
				return ' %= ';
		}
	},
	parseOperands(operands: SetNumberOperand[]) {
		let expression = '';
		let currentPriority;
		let nextPriority = false;
		const length = operands.length;
		for (let i = 0; i < length; i++) {
			const operand = operands[i];
			let operandName = NumberOperand.parseOperand!(operand);
			if (i !== 0)
				switch (operand.operation.replace('()', '')) {
					case 'add':
						expression += Command.setOperatorColor!(' + ');
						break;
					case 'sub':
						expression += Command.setOperatorColor!(' - ');
						break;
					case 'mul':
						expression += Command.setOperatorColor!(' * ');
						break;
					case 'div':
						expression += Command.setOperatorColor!(' / ');
						break;
					case 'mod':
						expression += Command.setOperatorColor!(' % ');
						break;
				}
			currentPriority = nextPriority;
			nextPriority = operands[i + 1]?.operation.includes('()');
			if (!currentPriority && nextPriority) {
				operandName = Token('(') + operandName;
			}
			if (currentPriority && !nextPriority) {
				operandName = operandName + Token(')');
			}
			expression += operandName;
		}
		return expression;
	},
	customParse({
		variable,
		operation,
		operands
	}: {
		variable: unknown;
		operation: string;
		operands: SetNumberOperand[];
	}) {
		const varDesc = Command.parseVariable!(variable, 'number', operation === 'set');
		const operator = Command.setOperatorColor!(this.parseOperation!(operation));
		const expression = this.parseOperands!(operands);
		return [
			{ color: 'variable' },
			{ text: t('command.setNumber.alias') + ' ' },
			{ color: 'restore' },
			{ text: `${varDesc}${operator}${expression}` }
		];
	}
});

export function useSetNumberCommandSchema() {
	const { form, load, commit } = useCommandSchema('setNumber', {
		skipWrite: true,
		onLoad() {
			requestFocus('setNumber-variable');
		}
	});
	useNumberOperandSchema();
	const onSave = (): void => {
		const variable = form.variable;
		if (VariableGetter.isNone!(variable as { key: string })) {
			requestFocus('setNumber-variable');
			return;
		}
		const operation = form.operation as string;
		const operands = form.operands as SetNumberOperand[];
		if (operands.length === 0) {
			requestFocus('setNumber-operands');
			return;
		}
		operands[0].operation = 'add';
		commit({ variable, operation, operands });
	};
	Command.cases.setNumber.customSave = onSave;
	return { form, save: onSave, load };
}
