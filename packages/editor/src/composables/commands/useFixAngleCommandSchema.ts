import { getFocus } from '@app/utils/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';
import { Command } from '@app/commands/command-object.ts';
import { Token } from '@app/commands/token.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { t } from '@app/i18n';

type FixAngleData = {
	actor: unknown;
	fixed: unknown;
	[k: string]: unknown;
};

Command.cases.fixAngle = new CommandSchema({
	name: 'fixAngle',
	fields: [
		{ key: 'actor', default: { type: 'trigger' } },
		{ key: 'fixed', default: true }
	],
	customParse({ actor, fixed }: FixAngleData) {
		const words = Command.words
			.push(Command.parseActor!(actor))
			// oxlint-disable-next-line no-base-to-string
			.push(t('command.fixAngle.fixed.' + fixed));
		return [
			{ color: 'actor' },
			{ text: t('command.fixAngle') + Token(': ') },
			{ text: words.join() }
		];
	}
});

export function useFixAngleCommandSchema() {
	return useCommandSchema('fixAngle', {
		onLoad() {
			getFocus(document.getElementById('fixAngle-actor')!);
		}
	});
}
