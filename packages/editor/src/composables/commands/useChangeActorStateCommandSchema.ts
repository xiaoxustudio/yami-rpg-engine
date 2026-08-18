import '@app/legacy/module/command/changeActorState.ts';
import { getFocus, read } from '@app/legacy/util/element-utils';
import { Command } from '@app/legacy/command/command-object.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useChangeActorStateCommandSchema() {
	const { form, save, load } = useCommandSchema('changeActorState', {
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
				Command.save?.({ actor, operation, stateId });
				break;
			}
			case 'remove-instance':
				Command.save?.({
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
