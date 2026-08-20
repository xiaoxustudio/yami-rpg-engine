import '@app/legacy/module/command/renderOutline.ts';
import { getFocus, read } from '@app/utils/element-utils';
import { Command } from '@app/legacy/command/command-object.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useRenderOutlineCommandSchema() {
	const { form, save, load, commit } = useCommandSchema('renderOutline', {
		onLoad() {
			getFocus(document.getElementById('renderOutline-operation'));
		}
	});
	const onSave = (): void => {
		const operation =
			read(document.getElementById('renderOutline-operation')) ?? form.operation;
		switch (operation) {
			case 'add': {
				commit({
					operation,
					actor: read(document.getElementById('renderOutline-actor')) ?? form.actor,
					color: read(document.getElementById('renderOutline-color')) ?? form.color
				});
				break;
			}
			case 'remove': {
				commit({
					operation,
					actor: read(document.getElementById('renderOutline-actor')) ?? form.actor
				});
				break;
			}
			case 'reset':
				commit({ operation });
				break;
		}
	};
	Command.cases.renderOutline.customSave = onSave;
	return { form, save: onSave, load };
}
