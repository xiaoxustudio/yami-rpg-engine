import '@app/legacy/module/command/gameData.ts';
import { getFocus, read } from '@app/utils/element-utils';
import { Command } from '@app/legacy/command/command-object.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useGameDataCommandSchema() {
	const { form, save, load, commit } = useCommandSchema('gameData', {
		onLoad() {
			getFocus(document.getElementById('gameData-operation')!);
		}
	});
	const onSave = (): void => {
		const operation = read(document.getElementById('gameData-operation')!) ?? form.operation;
		const index = read(document.getElementById('gameData-index')!) ?? form.index;
		switch (operation) {
			case 'save': {
				const variables =
					read(document.getElementById('gameData-variables')!) ?? form.variables;
				commit({ operation, index, variables: variables.trim() });
				break;
			}
			case 'load':
			case 'delete': {
				commit({ operation, index });
				break;
			}
		}
	};
	Command.cases.gameData.customSave = onSave;
	return { form, save: onSave, load };
}
