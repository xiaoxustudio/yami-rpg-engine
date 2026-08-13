import { $, getElementReader } from '@/util/dom.ts';
import { getFocus, write } from '@/util/element-utils.ts';
import { Command } from '@/command/command-object.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

Command.cases.gameData = new CommandSchema({
	name: 'gameData',
	onInitialize() {
		$('#gameData-operation').loadItems([
			{ name: 'Save', value: 'save' },
			{ name: 'Load', value: 'load' },
			{ name: 'Delete', value: 'delete' }
		]);
		$('#gameData-operation')
			.enableHiddenMode()
			.relate([
				{
					case: 'save',
					targets: [$('#gameData-index'), $('#gameData-variables')]
				},
				{ case: ['load', 'delete'], targets: [$('#gameData-index')] }
			]);
	},
	customParse({
		operation,
		index,
		variables
	}: {
		operation: string;
		index: unknown;
		variables: string;
	}) {
		const words = Command.words
			.push(Local.get!('command.gameData.' + operation))
			.push(Command.parseVariableNumber!(index));
		switch (operation) {
			case 'save':
				if (variables) {
					const label = Local.get!('command.gameData.variables');
					const keys = variables
						.split(/\s*,\s*/)
						.map((key: string) => Command.setVariableColor!(key));
					const string = keys.join(Token(', '));
					words.push(label + ' ' + Token('{') + string + Token('}'));
				}
				break;
		}
		return [
			{ color: 'system' },
			{ text: Local.get!('command.gameData') + Token(': ') },
			{ text: words.join() }
		];
	},
	customLoad({ operation = 'save', index = 0, variables = '' }) {
		write($('#gameData-operation'), operation);
		write($('#gameData-index'), index);
		write($('#gameData-variables'), variables);
		getFocus($('#gameData-operation'));
	},
	customSave() {
		const read = getElementReader('gameData');
		const operation = read('operation');
		switch (operation) {
			case 'save': {
				const index = read('index');
				const variables = read('variables').trim();
				Command.save!({ operation, index, variables });
				break;
			}
			case 'load':
			case 'delete': {
				const index = read('index');
				Command.save!({ operation, index });
				break;
			}
		}
	}
});
