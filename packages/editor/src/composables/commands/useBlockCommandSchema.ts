import '@app/legacy/module/command/block.ts';
import { $ } from '@app/legacy/util/dom.ts';
import { getFocus, read } from '@app/legacy/util/element-utils';
import { Command } from '@app/legacy/command/command-object.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

let commands: unknown = null;

export function useBlockCommandSchema() {
	const { form, save, load } = useCommandSchema('block', {
		onLoad(params) {
			commands = params.commands ?? [];
			getFocus($('#block-note'));
		}
	});
	const onSave = (): void => {
		const note = ((read($('#block-note')) ?? form.note) as string).trim();
		const asynchronous = read($('#block-asynchronous')) ?? form.asynchronous;
		Command.save?.({ note, asynchronous, commands });
	};
	const reset = (): void => {
		commands = null;
	};
	Command.cases.block.customSave = onSave;
	return { form, save: onSave, load, reset };
}
