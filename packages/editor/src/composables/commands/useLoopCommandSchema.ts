import '@app/legacy/module/command/loop.ts';
import { getFocus, read } from '@app/utils/element-utils';
import { Command } from '@app/legacy/command/command-object.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

let commands: unknown = null;

export function useLoopCommandSchema() {
	const { form, save, load } = useCommandSchema('loop', {
		onLoad(params) {
			commands = params.commands ?? [];
			getFocus(document.getElementById('loop-conditions')!);
		}
	});
	const onSave = (): void => {
		Command.save?.({
			mode: read(document.getElementById('loop-mode')!) ?? form.mode,
			conditions: read(document.getElementById('loop-conditions')!) ?? form.conditions,
			commands
		});
	};
	const reset = (): void => {
		commands = null;
	};
	Command.cases.loop.customSave = onSave;
	return { form, save: onSave, load, reset };
}
