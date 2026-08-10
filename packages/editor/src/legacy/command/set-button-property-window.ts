import { createPropertyWindow } from './property-window-factory.ts';
import { Command } from './command-object.ts';
import { Token } from './mark-string-manager.ts';

export const ButtonProperty = createPropertyWindow({
	prefix: 'setButton',
	locale: 'command.setButton',
	keys: [
		{
			name: 'Normal Image',
			value: 'normalImage',
			cases: ['normalImage', 'hoverImage', 'activeImage'],
			uiName: 'image',
			default: ''
		},
		{
			name: 'Hover Image',
			value: 'hoverImage',
			cases: ['normalImage', 'hoverImage', 'activeImage'],
			uiName: 'image',
			default: ''
		},
		{
			name: 'Active Image',
			value: 'activeImage',
			cases: ['normalImage', 'hoverImage', 'activeImage'],
			uiName: 'image',
			default: ''
		},
		{
			name: 'Normal Clip',
			value: 'normalClip',
			cases: ['normalClip', 'hoverClip', 'activeClip'],
			uiName: 'clip-box',
			default: [0, 0, 0, 0]
		},
		{
			name: 'Hover Clip',
			value: 'hoverClip',
			cases: ['normalClip', 'hoverClip', 'activeClip'],
			uiName: 'clip-box',
			default: [0, 0, 0, 0]
		},
		{
			name: 'Active Clip',
			value: 'activeClip',
			cases: ['normalClip', 'hoverClip', 'activeClip'],
			uiName: 'clip-box',
			default: [0, 0, 0, 0]
		},
		{
			name: 'Normal Tint',
			value: 'normalTint',
			cases: ['normalTint', 'hoverTint', 'activeTint'],
			uiName: 'tint-box',
			default: [0, 0, 0, 0]
		},
		{
			name: 'Hover Tint',
			value: 'hoverTint',
			cases: ['normalTint', 'hoverTint', 'activeTint'],
			uiName: 'tint-box',
			default: [0, 0, 0, 0]
		},
		{
			name: 'Active Tint',
			value: 'activeTint',
			cases: ['normalTint', 'hoverTint', 'activeTint'],
			uiName: 'tint-box',
			default: [0, 0, 0, 0]
		},
		{ name: 'Image Opacity', value: 'imageOpacity', default: 1 },
		{ name: 'Content', value: 'content', default: '' },
		{ name: 'Size', value: 'size', default: 16 },
		{ name: 'Letter Spacing', value: 'letterSpacing', default: 0 }
	],
	openData(defaults: Record<string, unknown>, key: string, value: unknown) {
		const array = value as unknown[];
		switch (key) {
			case 'normalImage':
			case 'hoverImage':
			case 'activeImage':
				defaults.image = value;
				break;
			case 'normalClip':
			case 'hoverClip':
			case 'activeClip':
				defaults['clip-0'] = array[0];
				defaults['clip-1'] = array[1];
				defaults['clip-2'] = array[2];
				defaults['clip-3'] = array[3];
				break;
			case 'normalTint':
			case 'hoverTint':
			case 'activeTint':
				defaults['tint-0'] = array[0];
				defaults['tint-1'] = array[1];
				defaults['tint-2'] = array[2];
				defaults['tint-3'] = array[3];
				break;
			default:
				defaults[key] = value;
				break;
		}
	},
	saveData(key: string, read: (k: string) => any) {
		switch (key) {
			case 'normalImage':
			case 'hoverImage':
			case 'activeImage':
				return read('image');
			case 'normalClip':
			case 'hoverClip':
			case 'activeClip':
				return [read('clip-0'), read('clip-1'), read('clip-2'), read('clip-3')];
			case 'normalTint':
			case 'hoverTint':
			case 'activeTint':
				return [read('tint-0'), read('tint-1'), read('tint-2'), read('tint-3')];
			default:
				return read(key);
		}
	},
	parsers: {
		normalImage: (value: unknown): string => Command.parseFileName!(value as string),
		hoverImage: (value: unknown): string => Command.parseFileName!(value as string),
		activeImage: (value: unknown): string => Command.parseFileName!(value as string),
		normalClip: (value: unknown): string => {
			const arr = value as number[];
			const params = [
				Command.setNumberColor!(arr[0]),
				Command.setNumberColor!(arr[1]),
				Command.setNumberColor!(arr[2]),
				Command.setNumberColor!(arr[3])
			];
			return params.join(Token(', '));
		},
		hoverClip: (value: unknown): string => {
			const arr = value as number[];
			const params = [
				Command.setNumberColor!(arr[0]),
				Command.setNumberColor!(arr[1]),
				Command.setNumberColor!(arr[2]),
				Command.setNumberColor!(arr[3])
			];
			return params.join(Token(', '));
		},
		activeClip: (value: unknown): string => {
			const arr = value as number[];
			const params = [
				Command.setNumberColor!(arr[0]),
				Command.setNumberColor!(arr[1]),
				Command.setNumberColor!(arr[2]),
				Command.setNumberColor!(arr[3])
			];
			return params.join(Token(', '));
		},
		normalTint: (value: unknown): string => {
			const arr = value as number[];
			const params = [
				Command.setNumberColor!(arr[0]),
				Command.setNumberColor!(arr[1]),
				Command.setNumberColor!(arr[2]),
				Command.setNumberColor!(arr[3])
			];
			return params.join(Token(', '));
		},
		hoverTint: (value: unknown): string => {
			const arr = value as number[];
			const params = [
				Command.setNumberColor!(arr[0]),
				Command.setNumberColor!(arr[1]),
				Command.setNumberColor!(arr[2]),
				Command.setNumberColor!(arr[3])
			];
			return params.join(Token(', '));
		},
		activeTint: (value: unknown): string => {
			const arr = value as number[];
			const params = [
				Command.setNumberColor!(arr[0]),
				Command.setNumberColor!(arr[1]),
				Command.setNumberColor!(arr[2]),
				Command.setNumberColor!(arr[3])
			];
			return params.join(Token(', '));
		},
		content: (value: unknown): string => Command.parseVariableTemplate!(value),
		imageOpacity: (value: unknown): string => Command.setNumberColor!(value as number),
		size: (value: unknown): string => Command.setNumberColor!(value as number),
		letterSpacing: (value: unknown): string => Command.setNumberColor!(value as number)
	}
});
