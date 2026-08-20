import { Command } from '@app/legacy/command/command-object.ts';
import { Token } from '@app/legacy/command/mark-string-manager.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { t } from '@app/i18n';

Command.cases.deleteElement = new CommandSchema({
	name: 'deleteElement',
	fields: [
		{ key: 'operation', default: 'delete-element' },
		{ key: 'element', default: { type: 'trigger' } }
	],
	customParse({ operation, element }: { operation: string; element: unknown }) {
		let info;
		switch (operation) {
			case 'delete-element':
				info = Command.parseElement!(element);
				break;
			case 'delete-children':
				info =
					Command.parseElement!(element) +
					Token(' -> ') +
					t('command.deleteElement.children');
				break;
			case 'delete-all':
				info = t('command.deleteElement.all-elements');
				break;
		}
		return [
			{ color: 'element' },
			{ text: t('command.deleteElement') + Token(': ') },
			{ text: info }
		];
	}
});
