import { $ } from '@app/utils/dom';
import { createPropertyWindow } from './property-window-factory.ts';
import { Command } from '@app/commands/command-object.ts';
import { t, createGetter } from '@app/i18n';

export const ImageProperty = createPropertyWindow({
	prefix: 'setImage',
	locale: 'command.setImage',
	keys: [
		{ name: 'Image', value: 'image', default: '' },
		{ name: 'Display', value: 'display', default: 'stretch' },
		{ name: 'Flip', value: 'flip', default: 'none' },
		{ name: 'Blend', value: 'blend', default: 'normal' },
		{ name: 'Shift X', value: 'shiftX', default: 0 },
		{ name: 'Shift Y', value: 'shiftY', default: 0 },
		{ name: 'Clip X', value: 'clip-0', default: 0 },
		{ name: 'Clip Y', value: 'clip-1', default: 0 },
		{ name: 'Clip Width', value: 'clip-2', default: 0 },
		{ name: 'Clip Height', value: 'clip-3', default: 0 }
	],
	init() {
		const get = createGetter('command.setImage');
		$('#setImage-property-display').loadItems([
			{ name: get('display.stretch') || 'Stretch', value: 'stretch' },
			{ name: get('display.tile') || 'Tile', value: 'tile' },
			{ name: get('display.clip') || 'Clip', value: 'clip' },
			{ name: get('display.slice') || 'Slice', value: 'slice' }
		]);
		$('#setImage-property-flip').loadItems([
			{ name: get('flip.none') || 'None', value: 'none' },
			{ name: get('flip.horizontal') || 'Horizontal', value: 'horizontal' },
			{ name: get('flip.vertical') || 'Vertical', value: 'vertical' },
			{ name: get('flip.both') || 'Both', value: 'both' }
		]);
		$('#setImage-property-blend').loadItems([
			{ name: t('blend.normal') || 'Normal', value: 'normal' },
			{ name: t('blend.additive') || 'Additive', value: 'additive' },
			{ name: t('blend.subtract') || 'Subtract', value: 'subtract' },
			{ name: t('blend.mask') || 'Mask', value: 'mask' }
		]);
	},
	parsers: {
		image: (value) => Command.parseFileName(value),
		// oxlint-disable-next-line no-base-to-string
		display: (value, get) => get('display.' + value),
		// oxlint-disable-next-line no-base-to-string
		flip: (value, get) => get('flip.' + value),
		blend: (value) => Command.parseBlend(value),
		shiftX: (value) => Command.parseVariableNumber(value),
		shiftY: (value) => Command.parseVariableNumber(value),
		'clip-0': (value) => Command.parseVariableNumber(value),
		'clip-1': (value) => Command.parseVariableNumber(value),
		'clip-2': (value) => Command.parseVariableNumber(value),
		'clip-3': (value) => Command.parseVariableNumber(value)
	}
});
