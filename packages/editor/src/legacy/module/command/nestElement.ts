import { Command } from '@app/legacy/command/command-object.ts';
import { Token } from '@app/legacy/command/mark-string-manager.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { t } from '@app/i18n';

Command.cases.nestElement = new CommandSchema({
	name: 'nestElement',
	fields: [
		{ key: 'parent', domId: 'parent', default: { type: 'trigger' } },
		{ key: 'child', domId: 'child', default: { type: 'latest' } }
	],
	customParse({ parent, child }: { parent: unknown; child: unknown }) {
		const pElement = Command.parseElement(parent);
		const cElement = Command.parseElement(child);
		return [
			{ color: 'element' },
			{ text: t('command.nestElement') + Token(': ') },
			{ text: pElement + Token(' -> ') + cElement }
		];
	}
});
