import { Command } from '@app/legacy/command/command-object.ts';
import { Token } from '@app/legacy/command/mark-string-manager.ts';
import { CommandSchema } from './schema.ts';
import { t } from '@app/i18n';

Command.cases.loadSubscene = new CommandSchema({
	name: 'loadSubscene',
	fields: [
		{ key: 'sceneId', default: '', required: true },
		{ key: 'shiftX', default: 0 },
		{ key: 'shiftY', default: 0 }
	],
	customParse({
		sceneId,
		shiftX,
		shiftY
	}: {
		sceneId: unknown;
		shiftX: unknown;
		shiftY: unknown;
	}) {
		const words = Command.words
			.push(Command.parseVariableFile(sceneId))
			.push(Command.parseVariableNumber(shiftX))
			.push(Command.parseVariableNumber(shiftY));
		return [
			{ color: 'scene' },
			{ text: t('command.loadSubscene') + Token(': ') },
			{ text: words.join() }
		];
	}
});
