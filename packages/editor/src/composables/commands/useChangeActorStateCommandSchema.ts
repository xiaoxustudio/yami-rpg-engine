import '@/module/command/changeActorState.ts';
import { $ } from '@/util/dom.ts';
import { getFocus, read } from '@/util/element-utils';
import { Command } from '@/command/command-object.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useChangeActorStateCommandSchema() {
	const { form, save, load } = useCommandSchema('changeActorState', {
		onLoad() {
			getFocus($('#changeActorState-actor'));
		}
	});
	const onSave = (): void => {
		const actor = read($('#changeActorState-actor')) ?? form.actor;
		const operation = read($('#changeActorState-operation')) ?? form.operation;
		switch (operation) {
			case 'add':
			case 'remove': {
				const stateId = read($('#changeActorState-stateId')) ?? form.stateId;
				if (stateId === '') {
					getFocus($('#changeActorState-stateId'));
					return;
				}
				Command.save?.({ actor, operation, stateId });
				break;
			}
			case 'remove-instance':
				Command.save?.({
					actor,
					operation,
					state: read($('#changeActorState-state')) ?? form.state
				});
				break;
		}
	};
	Command.cases.changeActorState.customSave = onSave;
	return { form, save: onSave, load };
}
