import { Command } from '@/command/command-object.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { GameLocal } from '@/local/local-object.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

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
			{ text: Local.get!('command.showChoices') + Token(': ') },
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
		const when = Local.get!('command.showChoices.when');
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
		contents.push({ color: 'flow' }, { text: Local.get!('command.showChoices.end') });
		return contents;
	}
});
