import { Command } from '@app/legacy/command/command-object.ts';
import { Token } from '@app/legacy/command/mark-string-manager.ts';
import { CommandSchema } from './schema.ts';
import { t } from '@app/i18n';

Command.cases.clampCamera = new CommandSchema({
	name: 'clampCamera',
	fields: [
		{ key: 'left', default: 0 },
		{ key: 'top', default: 0 },
		{ key: 'right', default: 0 },
		{ key: 'bottom', default: 0 }
	],
	customParse({
		left,
		top,
		right,
		bottom
	}: {
		left: unknown;
		top: unknown;
		right: unknown;
		bottom: unknown;
	}) {
		const words = Command.words
			.push(t('command.clampCamera.left') + Token(' = ') + Command.parseVariableNumber(left))
			.push(t('command.clampCamera.top') + Token(' = ') + Command.parseVariableNumber(top))
			.push(
				t('command.clampCamera.right') + Token(' = ') + Command.parseVariableNumber(right)
			)
			.push(
				t('command.clampCamera.bottom') + Token(' = ') + Command.parseVariableNumber(bottom)
			);
		return [
			{ color: 'scene' },
			{ text: t('command.clampCamera') + Token(': ') },
			{ text: words.join() }
		];
	}
});
