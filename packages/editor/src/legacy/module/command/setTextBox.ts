import { $, getElementReader } from '@/util/dom.ts';
import { clear, getFocus } from '@/util/element-utils';
import { Command } from '@/command/command-object.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { TextBoxProperty } from '@/command/set-textbox-property-window.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

Command.cases.setTextBox = new CommandSchema({
	name: 'setTextBox',
	fields: [
		{ key: 'element', default: { type: 'trigger' } },
		{ key: 'properties', default: [] }
	],
	onInitialize() {
		$('#setTextBox-confirm').on('click', () => this.save!());
		$('#setTextBox-properties').bind(TextBoxProperty);
		$('#setTextBox').on('closed', (event: any) => {
			clear($('#setTextBox-properties'));
		});
	},
	customParse({ element, properties }: any) {
		const words = Command.words.push(Command.parseElement!(element));
		for (const property of properties) {
			words.push(TextBoxProperty.parse!(property));
		}
		return [
			{ color: 'element' },
			{ text: Local.get!('command.setTextBox') + Token(': ') },
			{ text: words.join() }
		];
	},
	onLoad() {
		getFocus($('#setTextBox-element'));
	},
	customSave() {
		const read = getElementReader('setTextBox');
		const element = read('element');
		const properties = read('properties');
		if (properties.length === 0) {
			return getFocus($('#setTextBox-properties'));
		}
		Command.save!({ element, properties });
	}
});
