import '@app/legacy/module/command/gameData.ts';
import { $ } from '@app/legacy/util/dom.ts';
import { getFocus, read } from '@app/legacy/util/element-utils';
import { Command } from '@app/legacy/command/command-object.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useGameDataCommandSchema() {
	const { form, save, load } = useCommandSchema('gameData', {
		onLoad() {
			getFocus($('#gameData-operation'));
		}
	});
	const onSave = (): void => {
		const operation = read($('#gameData-operation')) ?? form.operation;
		const index = read($('#gameData-index')) ?? form.index;
		switch (operation) {
			case 'save': {
				const variables = read($('#gameData-variables')) ?? form.variables;
				Command.save!({ operation, index, variables: variables.trim() });
				break;
			}
			case 'load':
			case 'delete': {
				Command.save!({ operation, index });
				break;
			}
		}
	};
	Command.cases.gameData.customSave = onSave;
	return { form, save: onSave, load };
}
