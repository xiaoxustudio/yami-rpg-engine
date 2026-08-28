/* oxlint-disable eslint/no-restricted-properties */
import { getFocus } from '@app/utils/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';
import { Command } from '@app/commands/command-object.ts';
import { Token } from '@app/commands/token.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { t } from '@app/i18n';

Command.cases.activateScene = new CommandSchema({
	name: 'activateScene',
	fields: [{ key: 'pointer', default: 0 }],
	parsePointer(pointer: number) {
		switch (pointer) {
			case 0:
				return 'A';
			case 1:
				return 'B';
		}
	},
	customParse({ pointer }: { pointer: number }) {
		return [
			{ color: 'scene' },
			{ text: t('command.activateScene') + Token(': ') },
			{ text: this.parsePointer!(pointer) }
		];
	}
});

export function useActivateSceneCommandSchema() {
	return useCommandSchema('activateScene', {
		onLoad() {
			getFocus(document.getElementById('activateScene-pointer')!);
		}
	});
}
