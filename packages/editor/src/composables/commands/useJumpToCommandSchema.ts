import '@app/legacy/module/command/jumpTo.ts';
import { getFocus, read, write } from '@app/utils/element-utils.ts';
import { Command } from '@app/legacy/command/command-object.ts';
import { EventEditor } from '@app/legacy/command/event-editor.ts';

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
			Command.save?.({ operation, label });
			break;
		}
		case 'return':
			Command.save?.({ operation });
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
