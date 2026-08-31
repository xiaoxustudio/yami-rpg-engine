/* oxlint-disable eslint/no-restricted-properties */
import { getFocus, read } from '@app/utils/element-utils';
import { Command } from '@app/commands/command-object.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';
import { Token } from '@app/commands/token.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { getYamiI18n } from '@app/i18n';

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
		onLoad() {
			getFocus(document.getElementById('changeActorState-actor'));
		}
	});
	const onSave = (): void => {
		const actor = read(document.getElementById('changeActorState-actor')) ?? form.actor;
		const operation =
			read(document.getElementById('changeActorState-operation')) ?? form.operation;
		switch (operation) {
			case 'add':
			case 'remove': {
				const stateId =
					read(document.getElementById('changeActorState-stateId')) ?? form.stateId;
				if (stateId === '') {
					getFocus(document.getElementById('changeActorState-stateId'));
					return;
				}
				commit({ actor, operation, stateId });
				break;
			}
			case 'remove-instance':
				commit({
					actor,
					operation,
					state: read(document.getElementById('changeActorState-state')) ?? form.state
				});
				break;
		}
	};
	Command.cases.changeActorState.customSave = onSave;
	return { form, save: onSave, load };
}
