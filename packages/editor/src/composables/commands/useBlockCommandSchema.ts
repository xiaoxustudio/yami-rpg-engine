import '@app/legacy/module/command/block.ts';
import { getFocus, read } from '@app/utils/element-utils';
import { Command } from '@app/legacy/command/command-object.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

let commands: unknown = null;

export function useBlockCommandSchema() {
	const { form, save, load, commit } = useCommandSchema('block', {
		onLoad(params) {
			commands = params.commands ?? [];
			getFocus(document.getElementById('block-note')!);
		}
	});
	const onSave = (): void => {
		const note = ((read(document.getElementById('block-note')!) ?? form.note) as string).trim();
		const asynchronous =
			read(document.getElementById('block-asynchronous')!) ?? form.asynchronous;
		commit({ note, asynchronous, commands });
	};
	const reset = (): void => {
		commands = null;
	};
	Command.cases.block.customSave = onSave;
	return { form, save: onSave, load, reset };
}
