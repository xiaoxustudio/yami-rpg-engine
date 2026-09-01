/* oxlint-disable eslint/no-restricted-properties */
import { Command } from '@app/commands/command-object.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';
import { Token } from '@app/commands/token.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { getYamiI18n } from '@app/i18n';
import { requestFocus } from '@app/directives/focus';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});

Command.cases.detectTargets = new CommandSchema({
	name: 'detectTargets',
	fields: [
		{ key: 'actor', default: { type: 'trigger' } },
		{ key: 'distance', default: 0 },
		{ key: 'selector', default: 'enemy' },
		{ key: 'inSight', default: false }
	],
	parseInSight(inSight: boolean) {
		switch (inSight) {
			case true:
				return t('command.detectTargets.inSight');
			case false:
				return '';
		}
	},
	customParse({
		actor,
		distance,
		selector,
		inSight
	}: {
		actor: unknown;
		distance: unknown;
		selector: unknown;
		inSight: boolean;
	}) {
		const words = Command.words
			.push(Command.parseActor!(actor))
			.push(Token('≤') + Command.parseVariableNumber!(distance, 't'))
			.push(Command.parseActorSelector!(selector))
			.push(this.parseInSight!(inSight));
		return [
			{ color: 'actor' },
			{ text: t('command.detectTargets') + Token(': ') },
			{ text: words.join() }
		];
	}
});

export function useDetectTargetsCommandSchema() {
	const { form, save, load } = useCommandSchema('detectTargets', {
		skipWrite: true,
		onLoad() {
			requestFocus('detectTargets-actor');
		}
	});
	const onSave = (): void => {
		const distance = form.distance as number;
		if (distance === 0) {
			requestFocus('detectTargets-distance', 'all');
			return;
		}
		save();
	};
	Command.cases.detectTargets.customSave = onSave;
	return { form, save: onSave, load };
}
