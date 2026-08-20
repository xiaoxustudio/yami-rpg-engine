import { getFocus, read } from '@app/utils/element-utils';
import { Command } from '@app/commands/command-object.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';
import { Token } from '@app/commands/token.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { t } from '@app/i18n';

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
		onLoad() {
			getFocus(document.getElementById('detectTargets-actor')!);
		}
	});
	const onSave = (): void => {
		const distance = read(document.getElementById('detectTargets-distance')!) ?? form.distance;
		if (distance === 0) {
			getFocus(document.getElementById('detectTargets-distance')!, 'all');
			return;
		}
		save();
	};
	Command.cases.detectTargets.customSave = onSave;
	return { form, save: onSave, load };
}
