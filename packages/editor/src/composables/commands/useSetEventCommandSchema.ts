import '@app/legacy/module/command/setEvent.ts';
import { $ } from '@app/legacy/util/dom.ts';
import { getFocus, read } from '@app/legacy/util/element-utils';
import { Command } from '@app/legacy/command/command-object.ts';
import { VariableGetter } from '@app/legacy/command/variable-accessor-window.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useSetEventCommandSchema() {
	const { form, save, load } = useCommandSchema('setEvent', {
		onLoad() {
			getFocus($('#setEvent-operation'));
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
		const operation = read($('#setEvent-operation')) ?? form.operation;
		switch (operation) {
			case 'stop-propagation':
				Command.save?.({ operation });
				break;
			case 'pause':
			case 'continue': {
				const variable = read($('#setEvent-variable')) ?? form.variable;
				if (VariableGetter.isNone!(variable)) {
					getFocus($('#setEvent-variable'));
					return;
				}
				Command.save?.({ operation, variable });
				break;
			}
			case 'enable':
			case 'disable':
			case 'highest-priority': {
				const eventId = read($('#setEvent-eventId')) ?? form.eventId;
				if (eventId === '') {
					getFocus($('#setEvent-eventId'));
					return;
				}
				Command.save?.({ operation, eventId });
				break;
			}
			case 'goto-choice-branch':
				Command.save?.({
					operation,
					choiceIndex: read($('#setEvent-choiceIndex')) ?? form.choiceIndex
				});
				break;
		}
	};
	Command.cases.setEvent.customLoad = onLoad;
	Command.cases.setEvent.customSave = onSave;
	return { form, save: onSave, load: onLoad };
}
