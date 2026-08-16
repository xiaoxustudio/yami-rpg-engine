import { Command } from '@/command/command-object.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

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
			{ text: Local.get!('command.activateScene') + Token(': ') },
			{ text: this.parsePointer!(pointer) }
		];
	}
});
