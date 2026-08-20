import { Command } from '@app/legacy/command/command-object.ts';
import { Token } from '@app/legacy/command/mark-string-manager.ts';
import { Data } from '@app/legacy/data/data-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { t } from '@app/i18n';

Command.cases.setObjectAnimation = new CommandSchema({
	name: 'setObjectAnimation',
	fields: [
		{ key: 'sort', default: 'actor' },
		{ key: 'actor', default: { type: 'trigger' } },
		{ key: 'trigger', default: { type: 'trigger' } },
		{ key: 'animation', default: { type: 'trigger' } },
		{ key: 'operation', default: 'set-tint' },
		{ key: 'tint-0', default: 0 },
		{ key: 'tint-1', default: 0 },
		{ key: 'tint-2', default: 0 },
		{ key: 'tint-3', default: 0 },
		{ key: 'opacity', default: 1 },
		{ key: 'offsetY', default: 0 },
		{ key: 'rotation', default: 0 },
		{ key: 'easingId', default: () => Data.easings[0].id },
		{ key: 'duration', default: 0 },
		{ key: 'wait', default: false }
	],
	parseTint(operation: string, [red, green, blue, gray]: number[]) {
		const label = t('command.setObjectAnimation.' + operation);
		const _red = Command.setNumberColor!(red);
		const _green = Command.setNumberColor!(green);
		const _blue = Command.setNumberColor!(blue);
		const _gray = Command.setNumberColor!(gray);
		switch (operation) {
			case 'set-tint':
				return (
					label +
					Token('(') +
					_red +
					Token(', ') +
					_green +
					Token(', ') +
					_blue +
					Token(', ') +
					_gray +
					Token(')')
				);
			case 'set-rgb':
				return (
					label +
					Token('(') +
					_red +
					Token(', ') +
					_green +
					Token(', ') +
					_blue +
					Token(')')
				);
			case 'set-gray':
				return label + Token('(') + _gray + Token(')');
		}
	},
	parseProperty(operation: string, property: string | number) {
		const label = t('command.setObjectAnimation.' + operation);
		return label + Token('(') + Command.parseVariableNumber!(property) + Token(')');
	},
	customParse({
		sort,
		object,
		operation,
		tint,
		opacity,
		offsetY,
		rotation,
		easingId,
		duration,
		wait
	}: {
		sort: string;
		object: { type: string; [k: string]: unknown };
		operation: string;
		tint: number[];
		opacity: string | number;
		offsetY: string | number;
		rotation: string | number;
		easingId: string;
		duration: string | number;
		wait: boolean;
	}) {
		const words = Command.words;
		words.push(t('command.setObjectAnimation.sort.' + sort));
		switch (sort) {
			case 'actor':
			case 'components':
				words.push(Command.parseActor!(object));
				break;
			case 'trigger':
				words.push(Command.parseTrigger!(object));
				break;
			case 'animation':
				words.push(Command.parseObject!(object));
				break;
		}
		switch (operation) {
			case 'set-tint':
			case 'set-rgb':
			case 'set-gray':
				words.push(this.parseTint!(operation, tint));
				break;
			case 'set-opacity':
				words.push(this.parseProperty!(operation, opacity));
				break;
			case 'set-offsetY':
				words.push(this.parseProperty!(operation, offsetY));
				break;
			case 'set-rotation':
				words.push(this.parseProperty!(operation, rotation));
				break;
		}
		words.push(Command.parseEasing!(easingId, duration, wait));
		return [
			{ color: 'object' },
			{ text: t('command.setObjectAnimation') + Token(': ') },
			{ text: words.join() }
		];
	}
});
