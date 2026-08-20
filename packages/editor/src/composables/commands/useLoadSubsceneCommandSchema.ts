import { getFocus } from '@app/utils/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';
import { Command } from '@app/commands/command-object.ts';
import { Token } from '@app/commands/token.ts';
import { CommandSchema } from '@app/commands/schema.ts';
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

export function useLoadSubsceneCommandSchema() {
	return useCommandSchema('loadSubscene', {
		onLoad() {
			getFocus(document.getElementById('loadSubscene-sceneId')!);
		}
	});
}
