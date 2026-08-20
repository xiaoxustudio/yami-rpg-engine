import { Command } from '@app/legacy/command/command-object.ts';
import { Token } from '@app/legacy/command/mark-string-manager.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { t } from '@app/i18n';

type JumpToData = {
	operation: string;
	label: string;
};

Command.cases.jumpTo = new CommandSchema({
	name: 'jumpTo',
	customParse({ operation, label }: JumpToData) {
		const words = Command.words;
		switch (operation) {
			case 'jump':
				words.push(label);
				break;
			case 'save-jump':
				words.push(label).push(t('command.jumpTo.save'));
				break;
			case 'return':
				words.push(t('command.jumpTo.savedLocation'));
				break;
		}
		return [
			{ color: 'flow' },
			{ text: t('command.jumpTo.alias') + Token(': ') },
			{ text: words.join() }
		];
	}
});
