import { $, getElementReader } from '@/util/dom.ts';
import { clear, getFocus } from '@/util/element-utils';
import { Command } from '@/command/command-object.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { TextProperty } from '@/command/set-text-property-window.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

Command.cases.setText = new CommandSchema({
	name: 'setText',
	fields: [
		{ key: 'element', default: { type: 'trigger' } },
		{ key: 'properties', default: [] }
	],
	onInitialize() {
		$('#setText-confirm').on('click', () => this.save());
		$('#setText-properties').bind(TextProperty);
		$('#setText').on('closed', (event: any) => {
			clear($('#setText-properties'));
		});
	},
	customParse({ element, properties }: any) {
		const words = Command.words.push(Command.parseElement(element));
		for (const property of properties) {
			words.push(TextProperty.parse(property));
		}
		return [
			{ color: 'element' },
			{ text: Local.get('command.setText') + Token(': ') },
			{ text: words.join() }
		];
	},
	onLoad() {
		getFocus($('#setText-element'));
	},
	customSave() {
		const read = getElementReader('setText');
		const element = read('element');
		const properties = read('properties');
		if (properties.length === 0) {
			return getFocus($('#setText-properties'));
		}
		Command.save({ element, properties });
	}
});
