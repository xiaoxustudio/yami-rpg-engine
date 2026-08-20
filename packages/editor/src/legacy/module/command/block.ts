import { Command } from '@app/legacy/command/command-object.ts';
import { Token } from '@app/legacy/command/mark-string-manager.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { t } from '@app/i18n';

Command.cases.block = new CommandSchema({
	name: 'block',
	fields: [
		{ key: 'note', default: '' },
		{ key: 'asynchronous', default: false }
	],
	customParse({
		note,
		asynchronous,
		commands
	}: {
		note: string;
		asynchronous: unknown;
		commands: unknown;
	}) {
		if (asynchronous === undefined) {
			asynchronous = false;
		}
		const asyncFlag = asynchronous ? Command.setOperatorColor!('*') : '';
		const blockNote = note || asyncFlag ? Token(': ') + note + asyncFlag : '';
		return [
			{ fold: true },
			{ color: 'flow' },
			{ text: t('command.block') + blockNote },
			{ children: commands },
			{ color: 'flow' },
			{ text: t('command.block.end') }
		];
	}
});
