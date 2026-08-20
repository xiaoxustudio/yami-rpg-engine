import '@app/legacy/module/command/showText.ts';
import { getFocus, read } from '@app/utils/element-utils';
import { Command } from '@app/legacy/command/command-object.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useShowTextCommandSchema() {
	const { form, save, load, commit } = useCommandSchema('showText', {
		onLoad(params) {
			const content = (params.content as string) ?? '';
			if (content === '') {
				getFocus(document.getElementById('showText-target'));
			} else {
				getFocus(document.getElementById('showText-content'));
			}
		}
	});
	const onSave = (): void => {
		const content = read(document.getElementById('showText-content')) ?? form.content;
		if (content === '') {
			getFocus(document.getElementById('showText-content'));
			return;
		}
		commit({
			target: read(document.getElementById('showText-target')) ?? form.target,
			parameters: read(document.getElementById('showText-parameters')) ?? form.parameters,
			content
		});
	};
	Command.cases.showText.customSave = onSave;
	return { form, save: onSave, load };
}
