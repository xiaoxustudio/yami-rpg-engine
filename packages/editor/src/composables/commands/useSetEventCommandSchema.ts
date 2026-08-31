/* oxlint-disable eslint/no-restricted-properties */
import { Command } from '@app/commands/command-object.ts';
import { Token } from '@app/commands/token.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { getYamiI18n } from '@app/i18n';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});
import { getFocus, read } from '@app/utils/element-utils';
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
		onLoad() {
			getFocus(document.getElementById('setEvent-operation')!);
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
		const operation = read(document.getElementById('setEvent-operation')!) ?? form.operation;
		switch (operation) {
			case 'stop-propagation':
				commit({ operation });
				break;
			case 'pause':
			case 'continue': {
				const variable =
					read(document.getElementById('setEvent-variable')!) ?? form.variable;
				if (VariableGetter.isNone!(variable)) {
					getFocus(document.getElementById('setEvent-variable')!);
					return;
				}
				commit({ operation, variable });
				break;
			}
			case 'enable':
			case 'disable':
			case 'highest-priority': {
				const eventId = read(document.getElementById('setEvent-eventId')!) ?? form.eventId;
				if (eventId === '') {
					getFocus(document.getElementById('setEvent-eventId')!);
					return;
				}
				commit({ operation, eventId });
				break;
			}
			case 'goto-choice-branch':
				commit({
					operation,
					choiceIndex:
						read(document.getElementById('setEvent-choiceIndex')!) ?? form.choiceIndex
				});
				break;
		}
	};
	Command.cases.setEvent.customLoad = onLoad;
	Command.cases.setEvent.customSave = onSave;
	return { form, save: onSave, load: onLoad };
}
