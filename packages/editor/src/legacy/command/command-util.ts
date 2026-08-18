import { Command } from './command-object.ts';
import { WordList } from '@app/composables/useWordList.ts';

interface CommandBranch {
	commands: CommandCase[];
}

interface CommandCase {
	id: string;
	params: {
		choices: CommandBranch[];
		branches: CommandBranch[];
		elseCommands?: CommandCase[];
		defaultCommands?: CommandCase[];
		commands: CommandCase[];
	};
}

Command.forEachCommand = function (
	commands: CommandCase[],
	handler: (command: CommandCase) => void
): void {
	const forEach = (commands: CommandCase[]): void => {
		for (const command of commands) {
			handler(command);
			switch (command.id) {
				case 'showChoices':
					for (const choice of command.params.choices) {
						forEach(choice.commands);
					}
					continue;
				case 'if':
					for (const branch of command.params.branches) {
						forEach(branch.commands);
					}
					if (command.params.elseCommands) {
						forEach(command.params.elseCommands);
					}
					continue;
				case 'switch':
					for (const branch of command.params.branches) {
						forEach(branch.commands);
					}
					if (command.params.defaultCommands) {
						forEach(command.params.defaultCommands);
					}
					continue;
				case 'loop':
					forEach(command.params.commands);
					continue;
				case 'forEach':
					forEach(command.params.commands);
					continue;
				case 'independent':
					forEach(command.params.commands);
					continue;
				case 'transition':
					forEach(command.params.commands);
					continue;
			}
		}
	};
	forEach(commands);
};

Command.WordList = WordList;
