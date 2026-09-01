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
	// oxlint-disable-next-line no-explicit-any
	parseTint(mode: 'full' | 'rgb' | 'gray', [red, green, blue, gray]: [any, any, any, any]) {
		const label = t('command.tintImage.' + mode);
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
			{ text: t('command.tintImage') + Token(': ') },
			{ text: words.join() }
		];
	}
});

export function useTintImageCommandSchema() {
	const { form, load, commit } = useCommandSchema('tintImage', {
		skipWrite: true,
		onLoad() {
			requestFocus('tintImage-element');
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
		write(document.getElementById('tintImage-filter'), tint);
	};
	const onSave = (): void => {
		const element = form.element;
		const mode = form.mode as 'full' | 'rgb' | 'gray';
		let red = form['tint-0'];
		let green = form['tint-1'];
		let blue = form['tint-2'];
		let gray = form['tint-3'];
		switch (mode) {
			case 'full':
				break;
			case 'rgb':
				gray = 0;
				break;
			case 'gray':
				red = 0;
				green = 0;
				blue = 0;
				break;
		}
		commit({
			element,
			mode,
			tint: [red, green, blue, gray],
			easingId: form.easingId,
			duration: form.duration,
			wait: form.wait
		});
	};
	Command.cases.tintImage.customLoad = onLoad;
	Command.cases.tintImage.customSave = onSave;
	return { form, save: onSave, load: onLoad };
}
