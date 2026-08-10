import { $ } from '@/util/dom.ts';
import { getFocus, read, write } from '@/util/element-utils.ts';
import { Command } from '@/command/command-object.ts';
import { VariableGetter } from '@/command/variable-accessor-window.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

Command.cases.deleteVariable = new CommandSchema({
	name: 'deleteVariable',
	fields: [{ key: 'variable', default: { type: 'local', key: '' } }],
	customParse({ variable }: any) {
		return [
			{ color: 'variable' },
			{ text: Local.get!('command.deleteVariable.alias') + ' ' },
			{ color: 'restore' },
			{ text: Command.parseVariable(variable, 'any') }
		];
	},
	customLoad({ variable = { type: 'local', key: '' } }) {
		write($('#deleteVariable-variable'), variable);
		getFocus($('#deleteVariable-variable'));
	},
	customSave() {
		const elVariable = $('#deleteVariable-variable');
		const variable = read(elVariable);
		if (VariableGetter.isNone(variable)) {
			return getFocus(elVariable);
		}
		Command.save({ variable });
	}
});
