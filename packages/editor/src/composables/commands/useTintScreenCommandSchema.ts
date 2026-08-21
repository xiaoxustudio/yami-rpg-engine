import { Command } from '@app/commands/command-object.ts';
import { Token } from '@app/commands/token.ts';
import { Data } from '@app/data/data-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { t } from '@app/i18n';
import { getFocus, read, write } from '@app/utils/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

Command.cases.tintScreen = new CommandSchema({
	name: 'tintScreen',
	fields: [
		{ key: 'tint-0', default: 0 },
		{ key: 'tint-1', default: 0 },
		{ key: 'tint-2', default: 0 },
		{ key: 'tint-3', default: 0 },
		{ key: 'easingId', default: () => Data.easings[0].id },
		{ key: 'duration', default: 0 },
		{ key: 'wait', default: false }
	],
	parseTint([red, green, blue, gray]: [any, any, any, any]) {
		const _red = Command.setNumberColor!(red);
		const _green = Command.setNumberColor!(green);
		const _blue = Command.setNumberColor!(blue);
		const _gray = Command.setNumberColor!(gray);
		return (
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
	},
	customParse({
		tint,
		easingId,
		duration,
		wait
	}: {
		tint: [unknown, unknown, unknown, unknown];
		easingId: unknown;
		duration: unknown;
		wait: unknown;
	}) {
		const words = Command.words
			.push(this.parseTint!(tint))
			.push(Command.parseEasing!(easingId, duration, wait));
		return [
			{ color: 'scene' },
			{ text: t('command.tintScreen') + Token(': ') },
			{ text: words.join() }
		];
	}
});

export function useTintScreenCommandSchema() {
	const { form, save, load, commit } = useCommandSchema('tintScreen', {
		onLoad() {
			getFocus(document.getElementById('tintScreen-tint-0'), 'all');
		}
	});
	const onLoad = (params: Record<string, unknown>): void => {
		const tint = (params.tint ?? [0, 0, 0, 0]) as number[];
		load({
			...params,
			'tint-0': tint[0],
			'tint-1': tint[1],
			'tint-2': tint[2],
			'tint-3': tint[3]
		});
		write(document.getElementById('tintScreen-filter'), tint);
	};
	const onSave = (): void => {
		const tint = [
			read(document.getElementById('tintScreen-tint-0')) ?? form['tint-0'],
			read(document.getElementById('tintScreen-tint-1')) ?? form['tint-1'],
			read(document.getElementById('tintScreen-tint-2')) ?? form['tint-2'],
			read(document.getElementById('tintScreen-tint-3')) ?? form['tint-3']
		];
		commit({
			tint,
			easingId: read(document.getElementById('tintScreen-easingId')) ?? form.easingId,
			duration: read(document.getElementById('tintScreen-duration')) ?? form.duration,
			wait: read(document.getElementById('tintScreen-wait')) ?? form.wait
		});
	};
	Command.cases.tintScreen.customLoad = onLoad;
	Command.cases.tintScreen.customSave = onSave;
	return { form, save: onSave, load: onLoad };
}
