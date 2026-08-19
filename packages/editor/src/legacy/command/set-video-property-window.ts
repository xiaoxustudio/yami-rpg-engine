import { $ } from '@app/utils/dom';
import { createPropertyWindow } from './property-window-factory.ts';
import { Command } from './command-object.ts';
import { t, createGetter } from '@app/i18n';

export const VideoProperty = createPropertyWindow({
	prefix: 'setVideo',
	locale: 'command.setVideo',
	keys: [
		{ name: 'Video', value: 'video', default: '' },
		{ name: 'Playback Rate', value: 'playbackRate', default: 1 },
		{ name: 'Loop', value: 'loop', default: false },
		{ name: 'Flip', value: 'flip', default: 'none' },
		{ name: 'Blend', value: 'blend', default: 'normal' }
	],
	init() {
		const get = createGetter('command.setVideo');
		$('#setVideo-property-loop').loadItems([
			{ name: get('loop.false') || 'Once', value: false },
			{ name: get('loop.true') || 'Loop', value: true }
		]);
		$('#setVideo-property-flip').loadItems([
			{ name: get('flip.none') || 'None', value: 'none' },
			{ name: get('flip.horizontal') || 'Horizontal', value: 'horizontal' },
			{ name: get('flip.vertical') || 'Vertical', value: 'vertical' },
			{ name: get('flip.both') || 'Both', value: 'both' }
		]);
		$('#setVideo-property-blend').loadItems([
			{ name: t('blend.normal') || 'Normal', value: 'normal' },
			{ name: t('blend.additive') || 'Additive', value: 'additive' },
			{ name: t('blend.subtract') || 'Subtract', value: 'subtract' }
		]);
	},
	parsers: {
		video: (value) => Command.parseFileName(value),
		playbackRate: (value) => Command.parseVariableNumber(value),
		loop: (value, get) => get('loop.' + value),
		flip: (value, get) => get('flip.' + value),
		blend: (value) => Command.parseBlend(value)
	}
});
