import { $, getElementReader, getElementWriter } from '@/util/dom.ts';
import { clear, getFocus } from '@/util/element-utils';
import { Token } from '@/command/mark-string-manager.ts';
import { Command } from '@/command/command-object.ts';
import { NumberOperand } from '@/command/set-value-operand-window.ts';
import { VariableGetter } from '@/command/variable-accessor-window.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

interface SetNumberOperand {
	operation: string;
	type: string;
	value?: number;
	property: string;
	data: string;
}

Command.cases.setNumber = new CommandSchema({
	name: 'setNumber',
	onInitialize() {
		$('#setNumber-operands')?.bind?.(NumberOperand);
		$('#setNumber')?.on?.('closed', (event: Event) => {
			clear($('#setNumber-operands'));
		});
	},
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
			{ text: Local.get!('command.setNumber.alias') + ' ' },
			{ color: 'restore' },
			{ text: `${varDesc}${operator}${expression}` }
		];
	},
	customLoad({
		variable = { type: 'local', key: '' },
		operation = 'set',
		operands = [{ operation: 'add', type: 'constant', value: 0 } as unknown as SetNumberOperand]
	}: {
		variable?: unknown;
		operation?: string;
		operands?: SetNumberOperand[];
	}) {
		const write = getElementWriter('setNumber');
		write('variable', variable);
		write('operation', operation);
		write('operands', operands.slice());
		getFocus($('#setNumber-variable'));
	},
	customSave() {
		const read = getElementReader('setNumber');
		const variable = read('variable');
		if (VariableGetter.isNone!(variable)) {
			return getFocus($('#setNumber-variable'));
		}
		const operation = read('operation');
		const operands = read('operands');
		if (operands.length === 0) {
			return getFocus($('#setNumber-operands'));
		}
		operands[0].operation = 'add';
		Command.save!({ variable, operation, operands });
	}
});
