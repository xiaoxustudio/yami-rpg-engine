/* oxlint-disable eslint/no-restricted-properties */
import { getFocus } from '@app/utils/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';
import { Command } from '@app/commands/command-object.ts';
import { Token } from '@app/commands/token.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { getYamiI18n } from '@app/i18n';

const t = (key: string) => getYamiI18n().global.t(key);

Command.cases.deleteObject = new CommandSchema({
	name: 'deleteObject',
	fields: [{ key: 'object', domId: 'object', default: { type: 'trigger' } }],
	customParse({ object }: { object: unknown }) {
		return [
			{ color: 'object' },
			{ text: t('command.deleteObject') + Token(': ') },
			{ text: Command.parseObject(object) }
		];
	}
});

export function useDeleteObjectCommandSchema() {
	return useCommandSchema('deleteObject', {
		onLoad() {
			getFocus(document.getElementById('deleteObject-object')!);
		}
	});
}
