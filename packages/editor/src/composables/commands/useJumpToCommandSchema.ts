import { getFocus, read, write } from '@app/utils/element-utils.ts';
import { Command } from '@app/commands/command-object.ts';
import { commit } from '@app/composables/useCommandSchema';
import { EventEditor } from '@app/legacy/command/event-editor.ts';
import { Token } from '@app/commands/token.ts';
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

type LabelCommand = {
	id: string;
	params: { name: string; [k: string]: unknown };
};

const loadLabels = (): Array<{ name: string; icon: string }> => {
	const items: Array<{ name: string; icon: string }> = [];
	const commands = read(EventEditor.commandList);
	if (!commands) return items;
	Command.forEachCommand!(commands, (command: LabelCommand) => {
		if (command.id === 'label') {
			items.push({
				name: command.params.name,
				icon: 'icon-label'
			});
		}
	});
	return items.sort((a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name));
};

const load = ({
	operation = 'jump',
	label = ''
}: {
	operation?: string;
	label?: string;
} = {}): void => {
	write(document.getElementById('jumpTo-operation')!, operation);
	write(document.getElementById('jumpTo-label')!, label);
	getFocus(document.getElementById('jumpTo-operation')!);
};

const save = (): unknown => {
	const operation = read(document.getElementById('jumpTo-operation')!);
	switch (operation) {
		case 'jump':
		case 'save-jump': {
			const label = read(document.getElementById('jumpTo-label')!).trim();
			if (label === '') {
				return getFocus(document.getElementById('jumpTo-label')!);
			}
			commit({ operation, label });
			break;
		}
		case 'return':
			commit({ operation });
			break;
	}
};

const schema = Command.cases.jumpTo;
schema.customLoad = load;
schema.customSave = save;
schema.onInitialize = (): void => {};

export function useJumpToCommandSchema() {
	return { load, save, loadLabels };
}
