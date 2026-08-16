import { Command } from '@/command/command-object.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { Data } from '@/data/data-object.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

Command.cases.tintImage = new CommandSchema({
	name: 'tintImage',
	fields: [
		{ key: 'element', default: { type: 'trigger' } },
		{ key: 'mode', default: 'full' },
		{ key: 'tint-0', default: 0 },
		{ key: 'tint-1', default: 0 },
		{ key: 'tint-2', default: 0 },
		{ key: 'tint-3', default: 0 },
		{ key: 'filter', default: [0, 0, 0, 0], domId: 'filter' },
		{ key: 'easingId', default: () => Data.easings[0].id },
		{ key: 'duration', default: 0 },
		{ key: 'wait', default: false }
	],
	parseTint(mode: 'full' | 'rgb' | 'gray', [red, green, blue, gray]: [any, any, any, any]) {
		const label = Local.get!('command.tintImage.' + mode);
		const _red = Command.setNumberColor!(red);
		const _green = Command.setNumberColor!(green);
		const _blue = Command.setNumberColor!(blue);
		const _gray = Command.setNumberColor!(gray);
		switch (mode) {
			case 'full':
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
			case 'rgb':
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
			case 'gray':
				return label + Token('(') + _gray + Token(')');
		}
	},
	customParse({
		element,
		mode,
		tint,
		easingId,
		duration,
		wait
	}: {
		element: unknown;
		mode: 'full' | 'rgb' | 'gray';
		tint: [unknown, unknown, unknown, unknown];
		easingId: unknown;
		duration: unknown;
		wait: unknown;
	}) {
		const words = Command.words
			.push(Command.parseElement!(element))
			.push(this.parseTint!(mode, tint))
			.push(Command.parseEasing!(easingId, duration, wait));
		return [
			{ color: 'element' },
			{ text: Local.get!('command.tintImage') + Token(': ') },
			{ text: words.join() }
		];
	}
});
