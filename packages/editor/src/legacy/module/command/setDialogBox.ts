import { $, getElementReader, getElementWriter } from '@/util/dom.ts';
import { clear, getFocus } from '@/util/element-utils';
import { Command } from '@/command/command-object.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { DialogBoxProperty } from '@/command/set-dialog-property-window.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

Command.cases.setDialogBox = new CommandSchema({
	name: 'setDialogBox',
	onInitialize() {
		$('#setDialogBox-properties').bind(DialogBoxProperty);
		$('#setDialogBox').on('closed', (event: Event) => {
			clear($('#setDialogBox-properties'));
		});
	},
	customParse({
		element,
		properties
	}: {
		element: unknown;
		properties: Array<{ key: string; value: unknown }>;
	}) {
		const words = Command.words.push(Command.parseElement!(element));
		for (const property of properties) {
			words.push(DialogBoxProperty.parse!(property));
		}
		return [
			{ color: 'element' },
			{ text: Local.get!('command.setDialogBox') + Token(': ') },
			{ text: words.join() }
		];
	},
	customLoad({
		element = { type: 'trigger' },
		properties = []
	}: {
		element: unknown;
		properties: unknown[];
	}) {
		const write = getElementWriter('setDialogBox');
		write('element', element);
		write('properties', properties.slice());
		getFocus($('#setDialogBox-element'));
	},
	customSave() {
		const read = getElementReader('setDialogBox');
		const element = read('element');
		const properties = read('properties');
		if (properties.length === 0) {
			return getFocus($('#setDialogBox-properties'));
		}
		Command.save!({ element, properties });
	}
});
