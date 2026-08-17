import '@app/legacy/module/command/showText.ts';
import { $ } from '@app/legacy/util/dom.ts';
import { getFocus, read } from '@app/legacy/util/element-utils';
import { Command } from '@app/legacy/command/command-object.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useShowTextCommandSchema() {
	const { form, save, load } = useCommandSchema('showText', {
		onLoad(params) {
			const content = (params.content as string) ?? '';
			if (content === '') {
				getFocus($('#showText-target'));
			} else {
				getFocus($('#showText-content'));
			}
		}
	});
	const onSave = (): void => {
		const content = read($('#showText-content')) ?? form.content;
		if (content === '') {
			getFocus($('#showText-content'));
			return;
		}
		Command.save?.({
			target: read($('#showText-target')) ?? form.target,
			parameters: read($('#showText-parameters')) ?? form.parameters,
			content
		});
	};
	Command.cases.showText.customSave = onSave;
	return { form, save: onSave, load };
}
