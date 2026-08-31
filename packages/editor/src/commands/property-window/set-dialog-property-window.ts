import { $ } from '@app/utils/dom';
import { createPropertyWindow } from './property-window-factory.ts';
import { Command } from '@app/commands/command-object.ts';
import { Token } from '@app/commands/token.ts';
import { Color } from '@app/tools/color-picker-window.ts';
import { getYamiI18n } from '@app/i18n';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});

const dialogEffectRelate = [
	{
		case: 'shadow',
		targets: ['effect-shadowOffsetX', 'effect-shadowOffsetY', 'effect-color']
	},
	{
		case: 'stroke',
		targets: ['effect-strokeWidth', 'effect-color']
	},
	{
		case: 'outline',
		targets: ['effect-color']
	}
];

export const DialogBoxProperty = createPropertyWindow({
	prefix: 'setDialogBox',
	locale: 'command.setDialogBox',
	keys: [
		{ name: 'Content', value: 'content', default: '' },
		{ name: 'Print Interval', value: 'interval', default: 0 },
		{ name: 'Size', value: 'size', default: 16 },
		{ name: 'Line Spacing', value: 'lineSpacing', default: 0 },
		{ name: 'Letter Spacing', value: 'letterSpacing', default: 0 },
		{ name: 'Color', value: 'color', default: 'ffffffff' },
		{ name: 'Font', value: 'font', default: '' },
		{
			name: 'Effect',
			value: 'effect',
			targets: ['effect-type'],
			default: 'none'
		},
		{ name: 'Blend', value: 'blend', default: 'normal' }
	],
	subRelates: [{ selector: 'effect-type', cases: dialogEffectRelate }],
	init() {
		const get = (key: string) => t('command.setDialogBox.' + key);
		$('#setDialogBox-property-effect-type').loadItems([
			{ name: get('effect.none') || 'None', value: 'none' },
			{ name: get('effect.shadow') || 'Shadow', value: 'shadow' },
			{ name: get('effect.stroke') || 'Stroke', value: 'stroke' },
			{ name: get('effect.outline') || 'Outline', value: 'outline' }
		]);
		$('#setDialogBox-property-blend').loadItems([
			{ name: t('blend.normal') || 'Normal', value: 'normal' },
			{ name: t('blend.additive') || 'Additive', value: 'additive' },
			{ name: t('blend.subtract') || 'Subtract', value: 'subtract' }
		]);
	},
	openData(defaults: Record<string, unknown>, key: string, value: unknown) {
		if (key === 'effect') {
			const effect = value as Record<string, unknown>;
			defaults['effect-type'] = effect.type;
			defaults['effect-shadowOffsetX'] = effect.shadowOffsetX ?? 1;
			defaults['effect-shadowOffsetY'] = effect.shadowOffsetY ?? 1;
			defaults['effect-strokeWidth'] = effect.strokeWidth ?? 1;
			defaults['effect-color'] = effect.color ?? '000000ff';
		} else {
			defaults[key] = value;
		}
	},
	saveData(key: string, read: (k: string) => unknown) {
		if (key === 'effect') {
			switch (read('effect-type')) {
				case 'none':
					return { type: 'none' };
				case 'shadow':
					return {
						type: 'shadow',
						shadowOffsetX: read('effect-shadowOffsetX'),
						shadowOffsetY: read('effect-shadowOffsetY'),
						color: read('effect-color')
					};
				case 'stroke':
					return {
						type: 'stroke',
						strokeWidth: read('effect-strokeWidth'),
						color: read('effect-color')
					};
				case 'outline':
					return {
						type: 'outline',
						color: read('effect-color')
					};
			}
		}
		return read(key);
	},
	parsers: {
		content: (value: unknown) => Command.parseVariableTemplate!(value),
		interval: (value: unknown) => Command.setNumberColor!(value),
		size: (value: unknown) => Command.setNumberColor!(value),
		lineSpacing: (value: unknown) => Command.setNumberColor!(value),
		letterSpacing: (value: unknown) => Command.setNumberColor!(value),
		color: (value: unknown) => Command.parseHexColor!(Color.simplifyHexColor(value)),
		font: (value: unknown, get: (key: string) => string) =>
			value ? Command.setStringColor!(value) : get('font.default'),
		effect: (value: unknown, get: (key: string) => string, name: string): string => {
			const v = value as {
				type: string;
				shadowOffsetX?: unknown;
				shadowOffsetY?: unknown;
				strokeWidth?: unknown;
				color?: unknown;
			};
			switch (v.type) {
				case 'none':
					return name + Token('(') + get('effect.none') + Token(')');
				case 'shadow': {
					const x = Command.setNumberColor!(v.shadowOffsetX);
					const y = Command.setNumberColor!(v.shadowOffsetY);
					const color = Command.parseHexColor!(Color.simplifyHexColor(v.color));
					return (
						name +
						Token('(') +
						get('effect.shadow') +
						Token(', ') +
						x +
						Token(', ') +
						y +
						Token(', ') +
						color +
						Token(')')
					);
				}
				case 'stroke': {
					const width = Command.setNumberColor!(v.strokeWidth);
					const color = Command.parseHexColor!(Color.simplifyHexColor(v.color));
					return (
						name +
						Token('(') +
						get('effect.stroke') +
						Token(', ') +
						width +
						Token(', ') +
						color +
						Token(')')
					);
				}
				case 'outline': {
					const color = Command.parseHexColor!(Color.simplifyHexColor(v.color));
					return (
						name + Token('(') + get('effect.outline') + Token(', ') + color + Token(')')
					);
				}
				default:
					return name;
			}
		},
		blend: (value: unknown) => Command.parseBlend!(value)
	}
});
