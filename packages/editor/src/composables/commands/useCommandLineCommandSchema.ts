/* oxlint-disable eslint/no-restricted-properties */
import { Command } from '@app/commands/command-object.ts';
import { VariableGetter } from '@app/commands/accessors/variable-accessor-window.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';
import { CommandSchema } from '@app/commands/schema.ts';
import { getYamiI18n } from '@app/i18n';
import { requestFocus } from '@app/directives/focus';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});

Command.cases.commandLine = new CommandSchema({
	name: 'commandLine',
	fields: [
		{ key: 'type', default: 'get' },
		{ key: 'key', default: '' },
		{ key: 'value', default: '' },
		{ key: 'variable', default: { type: 'local', key: '' } }
	],
	customParse({ type = 'get', key = '', value = '', variable = { type: 'local', key: '' } }) {
		const head = [
			{ color: 'system' },
			{ text: t('command.commandLine') },
			{ color: 'normal' },
			{ text: ' ' }
		];
		switch (type) {
			case 'set':
				const raw_value =
					typeof value == 'string' ? value : Command.parseVariable!(value, 'string');
				return head.concat(
					{ color: 'flow' },
					{ text: t('command.commandLine.set') },
					{ text: ' ' },
					{ color: 'text' },
					{ color: 'save' },
					{
						text: typeof key == 'string' ? key : Command.parseVariable!(key, 'string')
					},
					{ text: ' ' },
					...(raw_value.length
						? [
								{
									text: '='
								},
								{ text: ' ' },
								{ color: 'gray' },
								{ color: 'save' },
								{
									text: raw_value
								}
							]
						: [])
				);
			case 'has':
			case 'rm':
			case 'get':
				head.push(
					{ color: 'flow' },
					{
						text:
							type === 'get'
								? t('command.commandLine.get')
								: type === 'rm'
									? t('command.commandLine.rm')
									: t('command.commandLine.has')
					},
					{ text: ' ' },
					{ color: 'text' },
					{ color: 'save' },
					{
						text: typeof key == 'string' ? key : Command.parseVariable!(key, 'string')
					},
					{ text: ' ' },
					{ color: 'gray' },
					{ color: 'save' },
					{
						text: t('command.commandLine.variable')
					},
					{ text: ' ' },
					{
						text: Command.parseVariable!(variable, 'string')
					}
				);
				break;
		}

		return head;
	}
});

export function useCommandLineCommandSchema() {
	const { form, load, commit } = useCommandSchema('commandLine', { skipWrite: true });
	const onSave = (): void => {
		const key = form.key;
		if (
			(typeof key === 'string' && key.trim() === '') ||
			(typeof key === 'object' && VariableGetter.isNone!(key as { key: string }))
		) {
			requestFocus('commandLine-key');
			return;
		}
		const variable = form.variable;
		if (VariableGetter.isNone!(variable as { key: string })) {
			requestFocus('commandLine-variable');
			return;
		}
		commit({
			type: form.type,
			key,
			value: form.value,
			variable
		});
	};
	Command.cases.commandLine.customSave = onSave;
	return { form, save: onSave, load };
}
