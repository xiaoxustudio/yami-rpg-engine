/* oxlint-disable eslint/no-restricted-properties */
import { Command } from '@app/commands/command-object.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';
import { Token } from '@app/commands/token.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { getYamiI18n } from '@app/i18n';
import { requestFocus } from '@app/directives/focus';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});

Command.cases.changeActorState = new CommandSchema({
	name: 'changeActorState',
	fields: [
		{ key: 'actor', default: { type: 'trigger' } },
		{ key: 'operation', default: 'add' },
		{ key: 'stateId', default: '' },
		{ key: 'state', default: { type: 'trigger' } }
	],
	parseOperation(operation: string) {
		return t('command.changeActorState.' + operation);
	},
	customParse({
		actor,
		operation,
		stateId,
		state
	}: {
		actor: unknown;
		operation: string;
		stateId: unknown;
		state: unknown;
	}) {
		const words = Command.words
			.push(Command.parseActor!(actor))
			.push(this.parseOperation!(operation));
		switch (operation) {
			case 'add':
			case 'remove':
				words.push(Command.parseFileName!(stateId));
				break;
			case 'remove-instance':
				words.push(Command.parseState!(state));
				break;
		}
		return [
			{ color: 'actor' },
			{ text: t('command.changeActorState') + Token(': ') },
			{ text: words.join() }
		];
	}
});

export function useChangeActorStateCommandSchema() {
	const { form, load, commit } = useCommandSchema('changeActorState', {
		skipWrite: true,
		onLoad() {
			requestFocus('changeActorState-actor');
		}
	});
	const onSave = (): void => {
		const actor = form.actor;
		const operation = form.operation as string;
		switch (operation) {
			case 'add':
			case 'remove': {
				const stateId = form.stateId as string;
				if (stateId === '') {
					requestFocus('changeActorState-stateId');
					return;
				}
				commit({ actor, operation, stateId });
				break;
			}
			case 'remove-instance':
				commit({
					actor,
					operation,
					state: form.state
				});
				break;
		}
	};
	Command.cases.changeActorState.customSave = onSave;
	return { form, save: onSave, load };
}
