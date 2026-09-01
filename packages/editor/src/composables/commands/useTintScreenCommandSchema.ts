/* oxlint-disable eslint/no-restricted-properties */
import { Command } from '@app/commands/command-object.ts';
import { Token } from '@app/commands/token.ts';
import { Data } from '@app/data/data-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { getYamiI18n } from '@app/i18n';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});
import { write } from '@app/utils/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';
import { requestFocus } from '@app/directives/focus';

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
	// oxlint-disable-next-line no-explicit-any
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
	const { form, load, commit } = useCommandSchema('tintScreen', {
		skipWrite: true,
		onLoad() {
			requestFocus('tintScreen-tint-0', 'all');
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
		const tint = [form['tint-0'], form['tint-1'], form['tint-2'], form['tint-3']];
		commit({
			tint,
			easingId: form.easingId,
			duration: form.duration,
			wait: form.wait
		});
	};
	Command.cases.tintScreen.customLoad = onLoad;
	Command.cases.tintScreen.customSave = onSave;
	return { form, save: onSave, load: onLoad };
}
