import { $ } from '@/util/dom.ts';
import { createPropertyWindow } from './property-window-factory.ts';
import { Command } from './command-object.ts';
import { Local } from '@/tools/localization.ts';

export const ProgressBarProperty = createPropertyWindow({
	prefix: 'setProgressBar',
	locale: 'command.setProgressBar',
	keys: [
		{ name: 'Image', value: 'image', default: '' },
		{ name: 'Display', value: 'display', default: 'stretch' },
		{ name: 'Blend', value: 'blend', default: 'normal' },
		{ name: 'Progress', value: 'progress', default: 0 },
		{ name: 'Clip X', value: 'clip-0', default: 0 },
		{ name: 'Clip Y', value: 'clip-1', default: 0 },
		{ name: 'Clip Width', value: 'clip-2', default: 0 },
		{ name: 'Clip Height', value: 'clip-3', default: 0 },
		{ name: 'Color Red', value: 'color-0', default: 0 },
		{ name: 'Color Green', value: 'color-1', default: 0 },
		{ name: 'Color Blue', value: 'color-2', default: 0 },
		{ name: 'Color Alpha', value: 'color-3', default: 0 }
	],
	init() {
		const get = Local.createGetter!('command.setProgressBar');
		$('#setProgressBar-property-display').loadItems([
			{ name: get('display.stretch') || 'Stretch', value: 'stretch' },
			{ name: get('display.clip') || 'Clip', value: 'clip' }
		]);
		$('#setProgressBar-property-blend').loadItems([
			{ name: Local.get!('blend.normal') || 'Normal', value: 'normal' },
			{ name: Local.get!('blend.additive') || 'Additive', value: 'additive' },
			{ name: Local.get!('blend.subtract') || 'Subtract', value: 'subtract' }
		]);
	},
	parsers: {
		image: (value) => Command.parseFileName(value),
		display: (value, get) => get('display.' + value),
		blend: (value) => Command.parseBlend(value),
		progress: (value) => Command.parseVariableNumber(value),
		'clip-0': (value) => Command.parseVariableNumber(value),
		'clip-1': (value) => Command.parseVariableNumber(value),
		'clip-2': (value) => Command.parseVariableNumber(value),
		'clip-3': (value) => Command.parseVariableNumber(value),
		'color-0': (value) => Command.parseVariableNumber(value),
		'color-1': (value) => Command.parseVariableNumber(value),
		'color-2': (value) => Command.parseVariableNumber(value),
		'color-3': (value) => Command.parseVariableNumber(value)
	}
});
