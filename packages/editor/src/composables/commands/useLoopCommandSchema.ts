import '@/module/command/loop.ts';
import { $ } from '@/util/dom.ts';
import { getFocus, read } from '@/util/element-utils';
import { Command } from '@/command/command-object.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

let commands: unknown = null;

export function useLoopCommandSchema() {
	const { form, save, load } = useCommandSchema('loop', {
		onLoad(params) {
			commands = params.commands ?? [];
			getFocus($('#loop-conditions'));
		}
	});
	const onSave = (): void => {
		Command.save?.({
			mode: read($('#loop-mode')) ?? form.mode,
			conditions: read($('#loop-conditions')) ?? form.conditions,
			commands
		});
	};
	const reset = (): void => {
		commands = null;
	};
	Command.cases.loop.customSave = onSave;
	return { form, save: onSave, load, reset };
}
