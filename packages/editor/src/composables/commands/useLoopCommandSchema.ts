/* oxlint-disable eslint/no-restricted-properties */
import { Command } from '@app/commands/command-object.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';
import { useIfBranchSchema } from '@app/composables/useIfBranchSchema';

const IfBranch = useIfBranchSchema();
import { CommandSchema } from '@app/commands/schema.ts';
import { getYamiI18n } from '@app/i18n';
import { requestFocus } from '@app/directives/focus';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});

Command.cases.loop = new CommandSchema({
	name: 'loop',
	fields: [
		{ key: 'mode', default: 'all' },
		{ key: 'conditions', default: [] }
	],
	customParse({
		mode,
		conditions,
		commands
	}: {
		mode: string;
		conditions: Array<{ type: string }>;
		commands: unknown;
	}) {
		const contents: Array<{
			fold?: boolean;
			color?: string;
			text?: string;
			children?: unknown;
			break?: boolean;
		}> = [{ fold: true }, { color: 'flow' }];
		if (conditions.length !== 0) {
			const condition = IfBranch.parse!({ mode, conditions });
			contents.push(
				{ text: t('command.loop.while') },
				{ color: 'restore' },
				{ text: ' ' + condition }
			);
		} else {
			contents.push({ text: t('command.loop') });
		}
		contents.push({ children: commands }, { color: 'flow' }, { text: t('command.loop.end') });
		return contents;
	}
});

let commands: unknown = null;

export function useLoopCommandSchema() {
	const { form, load, commit } = useCommandSchema('loop', {
		skipWrite: true,
		onLoad(params) {
			commands = params.commands ?? [];
			requestFocus('loop-conditions');
		}
	});
	const onSave = (): void => {
		commit({
			mode: form.mode,
			conditions: form.conditions,
			commands
		});
	};
	const reset = (): void => {
		commands = null;
	};
	Command.cases.loop.customSave = onSave;
	return { form, save: onSave, load, reset };
}
