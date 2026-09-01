/* oxlint-disable eslint/no-restricted-properties */
import { useCommandSchema } from '@app/composables/useCommandSchema';
import { Command } from '@app/commands/command-object.ts';
import { Token } from '@app/commands/token.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { getYamiI18n } from '@app/i18n';
import { requestFocus } from '@app/directives/focus';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});

type ActorRef = {
	type: string;
	[k: string]: unknown;
};

type ChangeThreatData = {
	actor: ActorRef;
	target: ActorRef;
	operation: string;
	threat: number | ActorRef;
};

Command.cases.changeThreat = new CommandSchema({
	name: 'changeThreat',
	fields: [
		{ key: 'actor', default: { type: 'trigger' } },
		{ key: 'target', default: { type: 'trigger' } },
		{ key: 'operation', default: 'increase' },
		{ key: 'threat', default: 0 }
	],
	parseActors(actor: ActorRef, target: ActorRef) {
		const sActor = Command.parseActor!(actor);
		const dActor = Command.parseActor!(target);
		return sActor + Token(' -> ') + dActor;
	},
	parseOperation(operation: string) {
		return t('command.changeThreat.' + operation);
	},
	customParse({ actor, target, operation, threat }: ChangeThreatData) {
		const words = Command.words
			.push(this.parseActors!(actor, target))
			.push(this.parseOperation!(operation))
			.push(Command.parseVariableNumber!(threat));
		return [
			{ color: 'actor' },
			{ text: t('command.changeThreat') + Token(': ') },
			{ text: words.join() }
		];
	}
});

export function useChangeThreatCommandSchema() {
	return useCommandSchema('changeThreat', {
		skipWrite: true,
		onLoad() {
			requestFocus('changeThreat-actor');
		}
	});
}
