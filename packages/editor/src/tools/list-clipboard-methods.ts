import { getYamiI18n } from '@app/i18n';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});
import { Window } from '@app/tools/window-object.ts';
import { GlobalClipboard } from '@app/utils/clipboard';
import type { TreeListRowApi } from '@ui-kit';
import { treeRowCount, treeRowIndexOf, treeRowItemAt } from '@ui-kit';

const Clipboard = GlobalClipboard;

interface ListItem {
	id: string;
	name: string;
	class?: string;
	element?: unknown;
	[k: string]: unknown;
}

interface ListWithElements extends Partial<TreeListRowApi<ListItem>> {
	elements?: Array<HTMLElement & { item: ListItem }> & { count?: number };
	addNodeTo?: (item: ListItem, dItem: unknown) => void;
	deleteNode?: (item: ListItem) => void;
	select?: (item: unknown) => void;
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
			const get = (key: string) => t('confirmation.' + key);
			Window.confirm!(
				{
					message: t('confirmation.deleteSingleFile', { filename: item.name })
				},
				[
					{
						label: get!('yes'),
						click: () => {
							const index = treeRowIndexOf(this, item);
							this.deleteNode?.(item);
							closePanel();
							const count = treeRowCount(this);
							if (count !== 0) {
								const next = treeRowItemAt<ListItem>(
									this,
									Math.min(Math.max(index, 0), count - 1)
								);
								if (next !== undefined) {
									this.select?.(next);
								}
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
