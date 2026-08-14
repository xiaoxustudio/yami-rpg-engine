import { $ } from '@/util/dom.ts';
import { getFocus, read, write } from '@/util/element-utils.ts';
import { Command } from '@/command/command-object.ts';
import { EventEditor } from '@/command/event-editor.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { TextSuggestion, type TextSuggestionTarget } from '@/command/text-tip.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

type LabelCommand = {
	id: string;
	params: { name: string; [k: string]: unknown };
};

type JumpToData = {
	operation: string;
	label: string;
};

Command.cases.jumpTo = new CommandSchema({
	name: 'jumpTo',
	onInitialize() {
		TextSuggestion.listen!(
			$('#jumpTo-label') as unknown as TextSuggestionTarget,
			this.loadLabels
		);
		$('#jumpTo-operation')?.loadItems?.([
			{ name: 'Jump to Label', value: 'jump' },
			{ name: 'Save and Jump to Label', value: 'save-jump' },
			{ name: 'Jump to the Saved Location', value: 'return' }
		]);
		$('#jumpTo-operation')
			?.enableHiddenMode?.()
			?.relate?.([{ case: ['jump', 'save-jump'], targets: [$('#jumpTo-label')] }]);
	},
	loadLabels() {
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
		return items.sort((a: { name: string }, b: { name: string }) =>
			a.name.localeCompare(b.name)
		);
	},
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
	},
	customLoad({ operation = 'jump', label = '' }) {
		write($('#jumpTo-operation'), operation);
		write($('#jumpTo-label'), label);
		getFocus($('#jumpTo-operation'));
	},
	customSave() {
		const operation = read($('#jumpTo-operation'));
		switch (operation) {
			case 'jump':
			case 'save-jump': {
				const label = read($('#jumpTo-label')).trim();
				if (label === '') {
					return getFocus($('#jumpTo-label'));
				}
				Command.save!({ operation, label });
				break;
			}
			case 'return':
				Command.save!({ operation });
				break;
		}
	}
});
