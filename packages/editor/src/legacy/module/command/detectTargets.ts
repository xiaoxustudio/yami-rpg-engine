import { Command } from '@app/legacy/command/command-object.ts';
import { Token } from '@app/legacy/command/mark-string-manager.ts';
import { CommandSchema } from './schema.ts';
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
