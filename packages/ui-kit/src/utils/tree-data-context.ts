export interface TreeDataItem {
	id: string;
	class: string;
	name: string;
	children?: TreeDataItem[];
	[key: string]: unknown;
}

export interface TreeDataGroup {
	groupName: string;
	itemMap: Record<string, TreeDataItem>;
	itemList: TreeDataItem[];
}

export interface TreeDataCache {
	[key: string]: unknown;
}

export interface TreeDataLists {
	[key: string]: unknown;
}

export interface LocalizeAdapter {
	language: string;
	get(key: string): string;
	createGetter(key: string): (key: string) => string;
}

export class TreeDataContext {
	itemMap: Record<string, TreeDataItem>;
	groupMap: Record<string, TreeDataGroup>;
	itemCache: TreeDataCache;
	itemLists: TreeDataLists;
	localize: LocalizeAdapter | null;

	constructor(
		data: Record<string, unknown> & { settings: Record<string, string> },
		keysField: string,
		localize: LocalizeAdapter | null = null
	) {
		const itemMap: Record<string, TreeDataItem> = {};
		const groupMap: Record<string, TreeDataGroup> = {};

		const load = (groupKeys: string[], items: TreeDataItem[]) => {
			for (const item of items) {
				const itemKey = item.id;
				itemMap[itemKey] = item;
				if (item.class === 'folder') {
					groupMap[itemKey] = {
						groupName: item.name,
						itemMap: {},
						itemList: []
					};
					groupKeys.push(itemKey);
					load(groupKeys, item.children as TreeDataItem[]);
					groupKeys.pop();
					continue;
				}
				for (let i = 0; i < groupKeys.length; i++) {
					const group = groupMap[groupKeys[i]];
					group.itemMap[itemKey] = item;
					group.itemList.push(item);
				}
			}
		};
		load([], data[keysField] as TreeDataItem[]);

		const settings = data.settings;
		for (const [key, groupId] of Object.entries(settings)) {
			const groupKey = groupId as string;
			if (groupKey in groupMap) {
				groupMap[key] = groupMap[groupKey];
			} else {
				groupMap[key] = {
					groupName: '',
					itemMap: {},
					itemList: []
				};
			}
		}
		this.itemMap = itemMap;
		this.groupMap = groupMap;
		this.itemCache = {};
		this.itemLists = {};
		this.localize = localize;
	}

	getGroup(groupKey: string) {
		return this.groupMap[groupKey];
	}

	getCachedItems(key: string, builder: () => unknown) {
		if (!this.itemLists[key]) {
			this.itemLists[key] = builder();
		}
		return this.itemLists[key];
	}

	createItem(id: string, name: string, extra: object) {
		return { name, value: id, ...extra };
	}

	createNoneItem() {
		return {
			name: this.localize?.get('common.none') ?? 'None',
			value: ''
		};
	}
}
