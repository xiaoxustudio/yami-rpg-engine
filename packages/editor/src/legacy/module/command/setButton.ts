import { $, getElementReader } from '@/util/dom.ts';
import { clear, getFocus } from '@/util/element-utils.ts';
import { Command } from '@/command/command-object.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { ButtonProperty } from '@/command/set-button-property-window.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

Command.cases.setButton = new CommandSchema({
	name: 'setButton',
	fields: [
		{ key: 'element', default: { type: 'trigger' } },
		{ key: 'properties', default: [] }
	],
	onInitialize() {
		$('#setButton-confirm').on('click', () => this.save!());
		$('#setButton-properties').bind(ButtonProperty);
		$('#setButton').on('closed', (event: Event) => {
			clear($('#setButton-properties'));
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
			words.push(ButtonProperty.parse!(property));
		}
		return [
			{ color: 'element' },
			{ text: Local.get!('command.setButton') + Token(': ') },
			{ text: words.join() }
		];
	},
	onLoad() {
		getFocus($('#setButton-element'));
	},
	customSave() {
		const read = getElementReader('setButton');
		const element = read('element');
		const properties = read('properties');
		if (properties.length === 0) {
			return getFocus($('#setButton-properties'));
		}
		Command.save!({ element, properties });
	}
});
