import { TreeDataContext } from '@app/components/tree-data-context.ts';
import type { TreeDataItem } from '@ui-kit';
import { GameLocal } from '@app/local/local-object.ts';
import { parseLocalTip } from '@app/localize/dom-localizer';

export class EnumerationContext extends TreeDataContext {
	constructor(enumeration: Record<string, unknown>) {
		super(enumeration, 'strings');
	}

	getString(stringId: string): TreeDataItem | undefined {
		return this.itemMap[stringId];
	}

	getGroupString(groupKey: string | undefined, stringId: string): TreeDataItem | undefined {
		if (groupKey === undefined) return undefined;
		return this.groupMap[groupKey]?.itemMap[stringId];
	}

	getDefStringId(groupKey: string | undefined): string {
		if (groupKey === undefined) return '';
		return this.groupMap[groupKey]?.itemList[0]?.id ?? '';
	}

	getStringItems(groupKey: string | undefined, allowNone: boolean = false): unknown[] {
		if (groupKey === undefined) return [];
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
					let item = itemCache[string.id] as {
						value: string;
						name?: string;
						tip?: unknown;
					};
					if (item === undefined) {
						item = itemCache[string.id] = {
							value: string.id
						};
					}
					const name = GameLocal.replace(string.name ?? '');
					item.name = name;
					item.tip = string.note ? parseLocalTip(string.note as string, name) : undefined;
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
		}) as unknown[];
	}

	/**
	 * 返回缓存项列表，与 `EnumModule.getMergedItems` 声明的 `Array<{ value: string }>` 同形。
	 * `getCachedItems` 的形参与返回值都是 `unknown`，故在出口处断言一次（同 `getStringItems`）。
	 */
	getMergedItems(
		headItems: unknown[] | null | undefined,
		groupKey: string,
		mergedKey: string = 'merged'
	): Array<{ value: string }> {
		const headKey = (headItems ?? [])
			.map((item) => (item as { value?: string })?.value ?? '')
			.join(',');
		const key = `${groupKey}-${mergedKey}-${headKey}`;
		return this.getCachedItems(key, () => {
			const items = [...(headItems ?? [])];
			const group = this.groupMap[groupKey];
			if (group) {
				const itemCache = this.itemCache;
				for (const string of group.itemList) {
					let item = itemCache[string.id] as {
						value: string;
						name?: string;
						tip?: unknown;
					};
					if (item === undefined) {
						item = itemCache[string.id] = {
							value: string.id
						};
					}
					const name = GameLocal.replace(string.name ?? '');
					item.name = name;
					item.tip = string.note ? parseLocalTip(string.note as string, name) : undefined;
					items.push(item);
				}
			}
			return items;
		}) as Array<{ value: string }>;
	}
}
