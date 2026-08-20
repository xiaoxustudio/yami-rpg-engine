import { Command } from '@app/legacy/command/command-object.ts';
import { Token } from '@app/legacy/command/mark-string-manager.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { t } from '@app/i18n';

Command.cases.loadScene = new CommandSchema({
	name: 'loadScene',
	fields: [
		{ key: 'sceneId', default: '' },
		{ key: 'transfer', default: true },
		{ key: 'x', default: 0 },
		{ key: 'y', default: 0 }
	],
	customParse({
		sceneId,
		transfer,
		x,
		y
	}: {
		sceneId: unknown;
		transfer: unknown;
		x: unknown;
		y: unknown;
	}) {
		const words = Command.words.push(Command.parseVariableFile!(sceneId));
		if (transfer) {
			words.push(Command.parseVariableNumber!(x)).push(Command.parseVariableNumber!(y));
		}
		return [
			{ color: 'scene' },
			{ text: t('command.loadScene') + Token(': ') },
			{ text: words.join() }
		];
	}
});
