import { getFocus, read } from '@app/utils/element-utils';
import { Command } from '@app/commands/command-object.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';
import { Token } from '@app/commands/token.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { t } from '@app/i18n';

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
