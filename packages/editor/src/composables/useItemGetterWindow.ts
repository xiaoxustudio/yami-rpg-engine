import { reactive } from 'vue';
import { getWindowStore } from '@app/stores/window';
import { getFocus } from '@app/utils/element-utils';

export interface ItemGetterForm {
	type: string;
	actor: { type: string };
	key: string;
	itemId: string;
	variable: { type: string; key: string };
}

interface ItemGetterTarget {
	read?: () => any;
	input: (getter: Record<string, unknown>) => void;
	isPluginInput?: boolean;
}

interface ItemGetterWindow {
	form: ItemGetterForm;
	open: (target: ItemGetterTarget, defaults?: Partial<ItemGetterForm>) => void;
	confirm: () => void;
	onWindowClosed: () => void;
}

const form = reactive<ItemGetterForm>({
	type: 'trigger',
	actor: { type: 'trigger' },
	key: '',
	itemId: '',
	variable: { type: 'local', key: '' }
});
let callback: ((getter: Record<string, unknown>) => void) | null = null;
let pluginInput = false;

const open = (target: ItemGetterTarget, defaults?: Partial<ItemGetterForm>): void => {
	callback = (getter: Record<string, unknown>) => target.input(getter);
	pluginInput = target.isPluginInput === true;
	getWindowStore().open('itemGetter');

	let actor = { type: 'trigger' };
	let key = defaults?.key ?? '';
	let itemId = '';
	let variable = { type: 'local', key: '' };
	const item = target.read?.() ?? {};
	switch (item.type) {
		case 'by-key':
			actor = item.actor;
			key = item.key;
			break;
		case 'by-id':
			actor = item.actor;
			itemId = item.itemId;
			break;
		case 'variable':
			variable = item.variable;
			break;
	}
	Object.assign(form, { type: item.type, actor, key, itemId, variable });
	getFocus(document.getElementById('itemGetter-type'));
};

const confirm = (): void => {
	const data = form;
	let getter: Record<string, unknown> | undefined;
	switch (data.type) {
		case 'trigger':
		case 'latest':
			getter = { type: data.type };
			break;
		case 'by-key': {
			const actor = data.actor;
			const key = data.key;
			if (key === '') {
				getFocus(document.getElementById('itemGetter-key'));
				return;
			}
			getter = { type: data.type, actor, key };
			break;
		}
		case 'by-id': {
			const actor = data.actor;
			const itemId = data.itemId;
			if (itemId === '') {
				getFocus(document.getElementById('itemGetter-itemId'));
				return;
			}
			getter = { type: data.type, actor, itemId };
			break;
		}
		case 'variable':
			if (data.variable.key === '') {
				getFocus(document.getElementById('itemGetter-variable'));
				return;
			}
			getter = { type: data.type, variable: data.variable };
			break;
	}
	if (pluginInput) {
		getter = { getter: 'item', ...getter };
	}
	callback?.(getter!);
	getWindowStore().close('itemGetter');
};

const onWindowClosed = (): void => {
	callback = null;
};

export function useItemGetterWindow(): ItemGetterWindow {
	return { form, open, confirm, onWindowClosed };
}
