import { Command } from '@app/commands/command-object.ts';
import { Token } from '@app/commands/token.ts';
import { Enum } from '@app/legacy/enum/enum-window.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { t } from '@app/i18n';
import { getFocus, read } from '@app/utils/element-utils';
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
	const { form, save, load, commit } = useCommandSchema('useItem', {
		onLoad() {
			document
				.getElementById('useItem-key')
				?.loadItems?.(Enum.getStringItems!('shortcut-key'));
			getFocus(document.getElementById('useItem-actor'));
		}
	});
	const onSave = (): void => {
		const actor = read(document.getElementById('useItem-actor')) ?? form.actor;
		const mode = read(document.getElementById('useItem-mode')) ?? form.mode;
		const wait = read(document.getElementById('useItem-wait')) ?? form.wait;
		switch (mode) {
			case 'by-key': {
				const key = read(document.getElementById('useItem-key')) ?? form.key;
				if (key === '') {
					getFocus(document.getElementById('useItem-key'));
					return;
				}
				commit({ actor, mode, key, wait });
				break;
			}
			case 'by-id': {
				const itemId = read(document.getElementById('useItem-itemId')) ?? form.itemId;
				if (itemId === '') {
					getFocus(document.getElementById('useItem-itemId'));
					return;
				}
				commit({ actor, mode, itemId, wait });
				break;
			}
			case 'by-item':
				commit({
					actor,
					mode,
					item: read(document.getElementById('useItem-item')) ?? form.item,
					wait
				});
				break;
		}
	};
	Command.cases.useItem.customSave = onSave;
	return { form, save: onSave, load };
}
