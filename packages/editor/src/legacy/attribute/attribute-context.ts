import { TreeDataContext } from '@app/legacy/components/tree-data-context.ts';
import { GameLocal } from '@app/legacy/local/local-object.ts';
import type { TreeDataItem } from '@ui-kit';

export class AttributeContext extends TreeDataContext {
	constructor(attribute: Record<string, unknown>) {
		super(attribute, 'keys');
	}

	getAttribute(attrId: string): TreeDataItem {
		return this.itemMap[attrId];
	}

	getGroupAttribute(groupKey: string, attrId: string): TreeDataItem | undefined {
		return this.groupMap[groupKey]?.itemMap[attrId];
	}

	getDefAttributeId(groupKey: string, type?: string): string {
		const group = this.groupMap[groupKey];
		if (group) {
			for (const attr of group.itemList) {
				if (!type || attr.type === type) {
					return attr.id;
				}
			}
		}
		return '';
	}

	getAttributeItems(
		groupKey: string,
		attrType: string = '',
		allowNone: boolean = false
	): Array<{ name: string; value: string }> {
		let key = groupKey + attrType;
		if (allowNone) {
			key += '-allowNone';
		}
		return this.getCachedItems(key, () => {
			const items = [];
			const group = this.groupMap[groupKey];
			if (group) {
				const attrTypes = attrType.split(' ');
				if (attrTypes.includes('string')) {
					attrTypes.append('enum');
				}
				const itemCache = this.itemCache;
				for (const attr of group.itemList) {
					if (!attrType || attrTypes.includes(attr.type as string)) {
						let item = itemCache[attr.id];
						if (item === undefined) {
							item = itemCache[attr.id] = {
								name: GameLocal.replace(attr.name ?? ''),
								value: attr.id
							};
						}
						items.push(item);
					}
				}
			}
			if (allowNone) {
				items.unshift(this.createNoneItem());
			}
			if (items.length === 0) {
				items.push(this.createNoneItem());
			}
			return items;
		}) as Array<{ name: string; value: string }>;
	}
}
