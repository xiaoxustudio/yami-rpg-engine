import { Command } from '@app/commands/command-object.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';
import { Token } from '@app/commands/token.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { getYamiI18n } from '@app/i18n';
import { requestFocus } from '@app/directives/focus';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});

Command.cases.block = new CommandSchema({
	name: 'block',
	fields: [
		{ key: 'note', default: '' },
		{ key: 'asynchronous', default: false }
	],
	customParse({
		note,
		asynchronous,
		commands
	}: {
		note: string;
		asynchronous: unknown;
		commands: unknown;
	}) {
		if (asynchronous === undefined) {
			asynchronous = false;
		}
		const asyncFlag = asynchronous ? Command.setOperatorColor!('*') : '';
		const blockNote = note || asyncFlag ? Token(': ') + note + asyncFlag : '';
		return [
			{ fold: true },
			{ color: 'flow' },
			{ text: t('command.block') + blockNote },
			{ children: commands },
			{ color: 'flow' },
			{ text: t('command.block.end') }
		];
	}
});

let commands: unknown = null;

export function useBlockCommandSchema() {
	const { form, load, commit } = useCommandSchema('block', {
		skipWrite: true,
		onLoad(params) {
			commands = params.commands ?? [];
			requestFocus('block-note');
		}
	});
	const onSave = (): void => {
		const note = ((form.note ?? '') as string).trim();
		const asynchronous = form.asynchronous;
		commit({ note, asynchronous, commands });
	};
	const reset = (): void => {
		commands = null;
	};
	Command.cases.block.customSave = onSave;
	return { form, save: onSave, load, reset };
}
