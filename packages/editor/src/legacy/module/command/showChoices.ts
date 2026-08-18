import { Command } from '@app/legacy/command/command-object.ts';
import { Token } from '@app/legacy/command/mark-string-manager.ts';
import { GameLocal } from '@app/legacy/local/local-object.ts';
import { CommandSchema } from './schema.ts';
import { t } from '@app/i18n';

Command.cases.showChoices = new CommandSchema({
	name: 'showChoices',
	customParse({
		choices,
		parameters
	}: {
		choices: Array<{ content: string; commands: unknown }>;
		parameters: unknown;
	}) {
		const contents: Array<{
			fold?: boolean;
			color?: string;
			text?: string;
			children?: unknown;
			break?: boolean;
		}> = [
			{ fold: true },
			{ color: 'flow' },
			{ text: t('command.showChoices') + Token(': ') },
			{ color: 'text' },
			{ color: 'save' }
		];
		contents.push({ text: Command.setNumberColor!(choices.length) });
		if (parameters) {
			contents.push(
				{ color: 'gray' },
				{ color: 'save' },
				{
					text: ' ' + Token('(') + Command.setCommaColors!(parameters) + Token(')')
				}
			);
		}
		contents.push({ color: 'flow' });
		contents.push({ break: true });
		const when = t('command.showChoices.when');
		for (const choice of choices) {
			contents.push(
				{ color: 'flow' },
				{ text: when + ' ' },
				{ color: 'text' },
				{
					text: Command.parseVariableTag!(GameLocal.replace!(choice.content))
				},
				{ children: choice.commands }
			);
		}
		contents.push({ color: 'flow' }, { text: t('command.showChoices.end') });
		return contents;
	}
});
