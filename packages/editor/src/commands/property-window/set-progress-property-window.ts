import { createPropertyWindow } from './property-window-factory.ts';
import { Command } from '@app/commands/command-object.ts';
import { getYamiI18n } from '@app/i18n';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});

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
		const get = (key: string) => t('command.setProgressBar.' + key);
		this.fields?.get('setProgressBar-property-display')?.loadItems?.([
			{ name: get('display.stretch') || 'Stretch', value: 'stretch' },
			{ name: get('display.clip') || 'Clip', value: 'clip' }
		]);
		this.fields?.get('setProgressBar-property-blend')?.loadItems?.([
			{ name: t('blend.normal') || 'Normal', value: 'normal' },
			{ name: t('blend.additive') || 'Additive', value: 'additive' },
			{ name: t('blend.subtract') || 'Subtract', value: 'subtract' }
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
