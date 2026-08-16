import { Command } from '@/command/command-object.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

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
				words.push(label).push(Local.get!('command.jumpTo.save'));
				break;
			case 'return':
				words.push(Local.get!('command.jumpTo.savedLocation'));
				break;
		}
		return [
			{ color: 'flow' },
			{ text: Local.get!('command.jumpTo.alias') + Token(': ') },
			{ text: words.join() }
		];
	}
});
