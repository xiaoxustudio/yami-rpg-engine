import { Command } from '@app/commands/command-object.ts';
import { Token } from '@app/commands/token.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { getYamiI18n } from '@app/i18n';
import { requestFocus } from '@app/directives/focus';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});
import { VariableGetter } from '@app/commands/accessors/variable-accessor-window.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

Command.cases.setEvent = new CommandSchema({
	name: 'setEvent',
	fields: [
		{ key: 'operation', default: 'stop-propagation' },
		{ key: 'variable', default: { type: 'global', key: '' } },
		{ key: 'eventId', default: '' },
		{ key: 'choiceIndex', default: 0 }
	],
	customParse({
		operation,
		variable,
		eventId,
		choiceIndex
	}: {
		operation: string;
		variable: unknown;
		eventId: unknown;
		choiceIndex: unknown;
	}) {
		const words = Command.words.push(t('command.setEvent.' + operation));
		switch (operation) {
			case 'pause':
				words.push(Command.parseVariable!(variable, 'object', true));
				break;
			case 'continue':
				words.push(Command.parseVariable!(variable, 'object'));
				break;
			case 'enable':
			case 'disable':
			case 'highest-priority':
				words.push(Command.parseFileName!(eventId));
				break;
			case 'goto-choice-branch':
				words.push(Command.parseVariableNumber!(choiceIndex));
				break;
		}
		return [
			{ color: 'flow' },
			{ text: t('command.setEvent.alias') + Token(': ') },
			{ text: words.join() }
		];
	}
});

export function useSetEventCommandSchema() {
	const { form, load, commit } = useCommandSchema('setEvent', {
		skipWrite: true,
		onLoad() {
			requestFocus('setEvent-operation');
		}
	});
	const onLoad = (params: Record<string, unknown>): void => {
		let operation = (params.operation as string) ?? 'stop-propagation';
		if (
			operation === 'prevent-scene-input-events' ||
			operation === 'restore-scene-input-events'
		) {
			operation = 'stop-propagation';
		}
		load({ ...params, operation });
	};
	const onSave = (): void => {
		const operation = form.operation;
		switch (operation) {
			case 'stop-propagation':
				commit({ operation });
				break;
			case 'pause':
			case 'continue': {
				const variable = form.variable;
				if (VariableGetter.isNone!(variable as { key: string })) {
					requestFocus('setEvent-variable');
					return;
				}
				commit({ operation, variable });
				break;
			}
			case 'enable':
			case 'disable':
			case 'highest-priority': {
				const eventId = form.eventId;
				if (eventId === '') {
					requestFocus('setEvent-eventId');
					return;
				}
				commit({ operation, eventId });
				break;
			}
			case 'goto-choice-branch':
				commit({ operation, choiceIndex: form.choiceIndex });
				break;
		}
	};
	Command.cases.setEvent.customLoad = onLoad;
	Command.cases.setEvent.customSave = onSave;
	return { form, save: onSave, load: onLoad };
}
