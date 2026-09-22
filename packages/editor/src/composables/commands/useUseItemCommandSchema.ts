import { Command } from '@app/commands/command-object.ts';
import { composableEls } from '@app/composables/element-registry';
import { Token } from '@app/commands/token.ts';
import { Enum } from '@app/enum/enum-window.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { getYamiI18n } from '@app/i18n';
import { requestFocus } from '@app/directives/focus';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});
import { useCommandSchema } from '@app/composables/useCommandSchema';

Command.cases.useItem = new CommandSchema({
	name: 'useItem',
	fields: [
		{ key: 'actor', default: { type: 'trigger' } },
		{ key: 'mode', default: 'by-key' },
		{ key: 'key', default: () => Enum.getDefStringId!('shortcut-key') },
		{ key: 'itemId', default: '' },
		{ key: 'item', default: { type: 'trigger' } },
		{ key: 'wait', default: false }
	],
	customParse({
		actor,
		mode,
		key,
		itemId,
		item,
		wait
	}: {
		actor: unknown;
		mode: string;
		key: unknown;
		itemId: unknown;
		item: unknown;
		wait: unknown;
	}) {
		const words = Command.words.push(Command.parseActor!(actor));
		switch (mode) {
			case 'by-key':
				words.push(Command.parseGroupEnumString!('shortcut-key', key));
				break;
			case 'by-id':
				words.push(Command.parseFileName!(itemId));
				break;
			case 'by-item':
				words.push(Command.parseItem!(item));
				break;
		}
		words.push(Command.parseWait!(wait));
		return [
			{ color: 'inventory' },
			{ text: t('command.useItem') + Token(': ') },
			{ text: words.join() }
		];
	}
});

export function useUseItemCommandSchema() {
	const { form, load, commit } = useCommandSchema('useItem', {
		skipWrite: true,
		onLoad() {
			composableEls.get('useItem-key')?.loadItems?.(Enum.getStringItems!('shortcut-key'));
			requestFocus('useItem-actor');
		}
	});
	const onSave = (): void => {
		const actor = form.actor;
		const mode = form.mode;
		const wait = form.wait;
		switch (mode) {
			case 'by-key': {
				const key = form.key;
				if (key === '') {
					requestFocus('useItem-key');
					return;
				}
				commit({ actor, mode, key, wait });
				break;
			}
			case 'by-id': {
				const itemId = form.itemId;
				if (itemId === '') {
					requestFocus('useItem-itemId');
					return;
				}
				commit({ actor, mode, itemId, wait });
				break;
			}
			case 'by-item':
				commit({ actor, mode, item: form.item, wait });
				break;
		}
	};
	Command.cases.useItem.customSave = onSave;
	return { form, save: onSave, load };
}
