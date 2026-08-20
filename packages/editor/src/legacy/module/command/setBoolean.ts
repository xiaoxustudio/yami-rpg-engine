import { Command } from '@app/legacy/command/command-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { t } from '@app/i18n';

interface SetBooleanOperand {
	type: string;
	value: boolean;
	variable: { type: string; key: string };
	index: number;
	key: string;
	script: string;
}

Command.cases.setBoolean = new CommandSchema({
	name: 'setBoolean',
	parseOperation(operation: string) {
		switch (operation) {
			case 'set':
				return ' = ';
			case 'not':
				return ' =! ';
			case 'and':
				return ' &= ';
			case 'or':
				return ' |= ';
			case 'xor':
				return ' ^= ';
		}
	},
	parseOperand(operand: SetBooleanOperand) {
		switch (operand.type) {
			case 'constant':
				return Command.setBooleanColor!(operand.value.toString());
			case 'variable':
				return Command.parseVariable!(operand.variable, 'boolean');
			case 'list':
				return Command.parseListItem!(operand.variable, operand.index);
			case 'parameter':
				return Command.parseParameter!(operand.key);
			case 'script':
				return Command.setScriptColor!(operand.script);
		}
	},
	customParse({
		variable,
		operation,
		operand
	}: {
		variable: unknown;
		operation: string;
		operand: SetBooleanOperand;
	}) {
		const varDesc = Command.parseVariable!(variable, 'boolean', operation === 'set');
		const operator = Command.setOperatorColor!(this.parseOperation!(operation));
		const value = this.parseOperand!(operand);
		return [
			{ color: 'variable' },
			{ text: t('command.setBoolean.alias') + ' ' },
			{ color: 'restore' },
			{ text: `${varDesc}${operator}${value}` }
		];
	}
});
