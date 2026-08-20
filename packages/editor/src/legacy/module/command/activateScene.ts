import { Command } from '@app/legacy/command/command-object.ts';
import { Token } from '@app/legacy/command/mark-string-manager.ts';
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
