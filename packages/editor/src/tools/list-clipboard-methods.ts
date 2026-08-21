import { createGetter } from '@app/i18n';
import { Window } from '@app/tools/window-object.ts';
import { GlobalClipboard } from '@app/utils/clipboard';

const Clipboard = GlobalClipboard;

interface ListItem {
	id: string;
	name: string;
	class?: string;
	element?: unknown;
	[k: string]: unknown;
}

interface ListWithElements {
	elements?: Array<HTMLElement & { item: ListItem }> & { count?: number };
	addNodeTo?: (item: ListItem, dItem: unknown) => void;
	deleteNode?: (item: ListItem) => void;
	select?: (item: ListItem | unknown) => void;
	copy?: (item: ListItem) => void;
	paste?: (dItem: unknown) => void;
	delete?: (item: ListItem) => void;
}

interface IdModule {
	idMap: Record<string, unknown>;
	createId: () => string;
}

interface ClosePanelModule {
	closePropertyPanel?: () => void;
	closeContentPanel?: () => void;
}

export interface ListClipboardConfig {
	module: IdModule & ClosePanelModule;
	list: ListWithElements;
	clipboardKey: string;
}

export function bindListClipboardMethods(config: ListClipboardConfig) {
	const { module, list, clipboardKey } = config;
	const closePanel = () => {
		if (module.closePropertyPanel) module.closePropertyPanel();
		else if (module.closeContentPanel) module.closeContentPanel();
	};

	list.copy = function (item: ListItem) {
		if (item && item.class !== 'folder') {
			Clipboard.write(clipboardKey, item);
		}
	};

	list.paste = function (dItem: unknown) {
		const copy = Clipboard.read(clipboardKey) as ListItem;
		if (copy) {
			if (module.idMap[copy.id]) {
				copy.id = module.createId();
				copy.name += ' - Copy';
			}
			this.addNodeTo?.(copy, dItem);
		}
	};

	list.delete = function (item: ListItem) {
		if (item) {
			const get = createGetter('confirmation');
			Window.confirm!(
				{
					message: get!('deleteSingleFile').replace('<filename>', item.name)
				},
				[
					{
						label: get!('yes'),
						click: () => {
							const elements = this.elements ?? [];
							const index = elements.indexOf(
								item.element as HTMLElement & { item: ListItem }
							);
							this.deleteNode?.(item);
							closePanel();
							const last = (elements.count ?? elements.length) - 1;
							const element = elements[Math.min(index, last)];
							if (element instanceof HTMLElement) {
								this.select?.(element.item);
							}
						}
					},
					{
						label: get!('no')
					}
				]
			);
		}
	};
}
