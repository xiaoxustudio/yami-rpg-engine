import { Command } from '@app/legacy/command/command-object.ts';
import { Token } from '@app/legacy/command/mark-string-manager.ts';
import { NumberOperand } from '@app/legacy/command/set-value-operand-window.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { t } from '@app/i18n';

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
