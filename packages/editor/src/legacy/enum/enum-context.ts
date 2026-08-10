import { TreeDataContext } from '@/components/tree-data-context.ts';
import type { TreeDataItem } from '@ui-kit';
import { GameLocal } from '@/local/local-object.ts';
import { Local } from '@/tools/localization.ts';

export class EnumerationContext extends TreeDataContext {
	constructor(enumeration: Record<string, unknown>) {
		super(enumeration, 'strings');
	}

	getString(stringId: string): TreeDataItem | undefined {
		return this.itemMap[stringId];
	}

	getGroupString(groupKey: string, stringId: string): TreeDataItem | undefined {
		return this.groupMap[groupKey]?.itemMap[stringId];
	}

	getDefStringId(groupKey: string): string {
		return this.groupMap[groupKey]?.itemList[0]?.id ?? '';
	}

	getStringItems(groupKey: string, allowNone: boolean = false): unknown[] {
		let key = groupKey;
		if (allowNone) {
			key += '-allowNone';
		}
		return this.getCachedItems(key, () => {
			const items: unknown[] = [];
			const group = this.groupMap[groupKey];
			if (group) {
				const itemCache = this.itemCache;
				for (const string of group.itemList) {
					let item = itemCache[string.id];
					if (item === undefined) {
						item = itemCache[string.id] = {
							value: string.id
						};
					}
					const name = GameLocal.replace(string.name ?? '');
					item.name = name;
					item.tip = string.note ? Local.parseTip!(string.note, name) : undefined;
					items.push(item);
				}
			}
			if (allowNone) {
				items.unshift(this.createNoneItem());
			}
			if (items.length === 0) {
				items.push(this.createNoneItem());
			}
			return items;
		});
	}

	getMergedItems(
		headItems: unknown[] | null | undefined,
		groupKey: string,
		mergedKey: string = 'merged'
	) {
		const key = `${groupKey}-${mergedKey}`;
		return this.getCachedItems(key, () => {
			const items = [...(headItems ?? [])];
			const group = this.groupMap[groupKey];
			if (group) {
				const itemCache = this.itemCache;
				for (const string of group.itemList) {
					let item = itemCache[string.id];
					if (item === undefined) {
						item = itemCache[string.id] = {
							value: string.id
						};
					}
					const name = GameLocal.replace(string.name ?? '');
					item.name = name;
					item.tip = string.note ? Local.parseTip!(string.note, name) : undefined;
					items.push(item);
				}
			}
			return items;
		});
	}
}
