/* oxlint-disable eslint/no-restricted-properties */
import { useCommandSchema } from '@app/composables/useCommandSchema';
import { Command } from '@app/commands/command-object.ts';
import { Token } from '@app/commands/token.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { getYamiI18n } from '@app/i18n';
import { requestFocus } from '@app/directives/focus';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});

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
		skipWrite: true,
		onLoad() {
			requestFocus('activateScene-pointer');
		}
	});
}
