/* oxlint-disable eslint/no-restricted-properties */
import { read } from '@app/utils/element-utils.ts';
import { Command } from '@app/commands/command-object.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';
import { EventEditor } from '@app/commands/event-editor.ts';
import { Token } from '@app/commands/token.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { getYamiI18n } from '@app/i18n';
import { requestFocus } from '@app/directives/focus';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});

type JumpToData = {
	operation: string;
	label: string;
};

Command.cases.jumpTo = new CommandSchema({
	name: 'jumpTo',
	fields: [
		{ key: 'operation', default: 'jump' },
		{ key: 'label', default: '' }
	],
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

export function useJumpToCommandSchema() {
	const { form, load, commit } = useCommandSchema('jumpTo', {
		skipWrite: true,
		onLoad() {
			requestFocus('jumpTo-operation');
		}
	});
	const onSave = (): unknown => {
		const operation = form.operation as string;
		switch (operation) {
			case 'jump':
			case 'save-jump': {
				const label = (form.label as string).trim();
				if (label === '') {
					return requestFocus('jumpTo-label');
				}
				commit({ operation, label });
				break;
			}
			case 'return':
				commit({ operation });
				break;
		}
	};
	Command.cases.jumpTo.customLoad = load;
	Command.cases.jumpTo.customSave = onSave;
	return { form, save: onSave, load, loadLabels };
}
