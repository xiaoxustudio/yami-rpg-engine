import '@/module/command/renderOutline.ts';
import { $ } from '@/util/dom.ts';
import { getFocus, read } from '@/util/element-utils';
import { Command } from '@/command/command-object.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useRenderOutlineCommandSchema() {
	const { form, save, load } = useCommandSchema('renderOutline', {
		onLoad() {
			getFocus($('#renderOutline-operation'));
		}
	});
	const onSave = (): void => {
		const operation = read($('#renderOutline-operation')) ?? form.operation;
		switch (operation) {
			case 'add': {
				Command.save!({
					operation,
					actor: read($('#renderOutline-actor')) ?? form.actor,
					color: read($('#renderOutline-color')) ?? form.color
				});
				break;
			}
			case 'remove': {
				Command.save!({
					operation,
					actor: read($('#renderOutline-actor')) ?? form.actor
				});
				break;
			}
			case 'reset':
				Command.save!({ operation });
				break;
		}
	};
	Command.cases.renderOutline.customSave = onSave;
	return { form, save: onSave, load };
}
