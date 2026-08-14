import { $ } from '@/util/dom.ts';
import { getFocus, read, write } from '@/util/element-utils.ts';
import { Command } from '@/command/command-object.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

Command.cases.deleteElement = new CommandSchema({
	name: 'deleteElement',
	onInitialize() {
		$('#deleteElement-operation')?.loadItems?.([
			{ name: 'Delete Element', value: 'delete-element' },
			{ name: 'Delete Children', value: 'delete-children' },
			{ name: 'Delete All', value: 'delete-all' }
		]);
		$('#deleteElement-operation')
			?.enableHiddenMode?.()
			?.relate?.([
				{
					case: ['delete-element', 'delete-children'],
					targets: [$('#deleteElement-element')]
				}
			]);
	},
	customParse({ operation, element }: { operation: string; element: unknown }) {
		let info;
		switch (operation) {
			case 'delete-element':
				info = Command.parseElement!(element);
				break;
			case 'delete-children':
				info =
					Command.parseElement!(element) +
					Token(' -> ') +
					Local.get!('command.deleteElement.children');
				break;
			case 'delete-all':
				info = Local.get!('command.deleteElement.all-elements');
				break;
		}
		return [
			{ color: 'element' },
			{ text: Local.get!('command.deleteElement') + Token(': ') },
			{ text: info }
		];
	},
	customLoad({ operation = 'delete-element', element = { type: 'trigger' } }) {
		write($('#deleteElement-operation'), operation);
		write($('#deleteElement-element'), element);
		getFocus($('#deleteElement-operation'));
	},
	customSave() {
		const operation = read($('#deleteElement-operation'));
		switch (operation) {
			case 'delete-element':
			case 'delete-children': {
				Command.save!({
					operation,
					element: read($('#deleteElement-element'))
				});
				break;
			}
			case 'delete-all':
				Command.save!({ operation });
				break;
		}
	}
});
