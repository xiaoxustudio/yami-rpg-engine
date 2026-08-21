import { getFocus, read } from '@app/utils/element-utils';
import { Command } from '@app/commands/command-object.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';
import { Token } from '@app/commands/token.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { Color } from '@app/tools/color-picker-window.ts';
import { t } from '@app/i18n';

type RenderOutlineOperation = 'add' | 'remove' | 'reset';

type RenderOutlineData = {
	operation: RenderOutlineOperation;
	actor: unknown;
	color: unknown;
	[k: string]: unknown;
};

Command.cases.renderOutline = new CommandSchema({
	name: 'renderOutline',
	fields: [
		{ key: 'operation', default: 'add' },
		{ key: 'actor', default: { type: 'trigger' } },
		{ key: 'color', default: 'ffffffff' }
	],
	customParse({ operation, actor, color }: RenderOutlineData) {
		const label = t('command.renderOutline.' + operation);
		const words = Command.words;
		switch (operation) {
			case 'add':
				words
					.push(label)
					.push(Command.parseActor!(actor))
					.push(Command.parseHexColor!(Color.simplifyHexColor(color)));
				break;
			case 'remove':
				words.push(label).push(Command.parseActor!(actor));
				break;
			case 'reset':
				words.push(label);
				break;
		}
		return [
			{ color: 'flow' },
			{ text: t('command.renderOutline') + Token(': ') },
			{ text: words.join() }
		];
	}
});

export function useRenderOutlineCommandSchema() {
	const { form, save, load, commit } = useCommandSchema('renderOutline', {
		onLoad() {
			getFocus(document.getElementById('renderOutline-operation'));
		}
	});
	const onSave = (): void => {
		const operation =
			read(document.getElementById('renderOutline-operation')) ?? form.operation;
		switch (operation) {
			case 'add': {
				commit({
					operation,
					actor: read(document.getElementById('renderOutline-actor')) ?? form.actor,
					color: read(document.getElementById('renderOutline-color')) ?? form.color
				});
				break;
			}
			case 'remove': {
				commit({
					operation,
					actor: read(document.getElementById('renderOutline-actor')) ?? form.actor
				});
				break;
			}
			case 'reset':
				commit({ operation });
				break;
		}
	};
	Command.cases.renderOutline.customSave = onSave;
	return { form, save: onSave, load };
}
