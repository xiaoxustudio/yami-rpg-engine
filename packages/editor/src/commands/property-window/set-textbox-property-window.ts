import { $ } from '@app/utils/dom';
import { createPropertyWindow } from './property-window-factory.ts';
import { Command } from '@app/commands/command-object.ts';
import { Color } from '@app/tools/color-picker-window.ts';
import { getYamiI18n } from '@app/i18n';

const t = (key: string) => getYamiI18n().global.t(key);

export const TextBoxProperty = createPropertyWindow({
	prefix: 'setTextBox',
	locale: 'command.setTextBox',
	keys: [
		{ name: 'Type', value: 'type', default: 'text' },
		{ name: 'Text', value: 'text', default: '' },
		{ name: 'Number', value: 'number', default: 0 },
		{ name: 'Min', value: 'min', default: 0 },
		{ name: 'Max', value: 'max', default: 0 },
		{ name: 'Decimal Places', value: 'decimals', default: 0 },
		{ name: 'Color', value: 'color', default: 'ffffffff' }
	],
	init() {
		const get = (key: string) => t('command.setTextBox.' + key);
		$('#setTextBox-property-type').loadItems([
			{ name: get('type.text') || 'Text', value: 'text' },
			{ name: get('type.number') || 'Number', value: 'number' }
		]);
	},
	parsers: {
		// oxlint-disable-next-line no-base-to-string
		type: (value, get) => get('type.' + value),
		text: (value) => {
			let text = value;
			if (typeof text === 'string' && text.length > 80) {
				text = text.slice(0, 80) + '...';
			}
			return Command.parseVariableString(text);
		},
		number: (value) => Command.parseVariableNumber(value),
		min: (value) => Command.parseVariableNumber(value),
		max: (value) => Command.parseVariableNumber(value),
		decimals: (value) => Command.setNumberColor(value),
		color: (value) => Command.parseHexColor(Color.simplifyHexColor(value))
	}
});
