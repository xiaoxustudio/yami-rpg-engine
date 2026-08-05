export interface TreeDataItem {
	id: string;
	class: string;
	name: string;
	children?: TreeDataItem[];
	[key: string]: any;
}

export interface TreeDataGroup {
	groupName: string;
	itemMap: Record<string, TreeDataItem>;
	itemList: TreeDataItem[];
}

export interface TreeDataCache {
	[key: string]: any;
}

export interface TreeDataLists {
	[key: string]: any;
}

export interface LocalizeAdapter {
	get(key: string): string;
}

export class TreeDataContext {
	itemMap: Record<string, TreeDataItem>;
	groupMap: Record<string, TreeDataGroup>;
	itemCache: TreeDataCache;
	itemLists: TreeDataLists;
	localize: LocalizeAdapter | null;

	constructor(data: any, keysField: any, localize: LocalizeAdapter | null = null) {
		const itemMap: Record<string, any> = {};
		const groupMap: Record<string, any> = {};

		const load = (groupKeys: string[], items: any[]) => {
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
					load(groupKeys, item.children);
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
		load([], data[keysField]);

		const settings = data.settings;
		for (const [key, groupId] of Object.entries(settings)) {
			if ((groupId as any) in groupMap) {
				groupMap[key as any] = groupMap[groupId as any];
			} else {
				if (groupId !== '') {
					settings[key] = '';
				}
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

	getGroup(groupKey: any) {
		return this.groupMap[groupKey];
	}

	getCachedItems(key: any, builder: any) {
		if (!this.itemLists[key]) {
			this.itemLists[key] = builder();
		}
		return this.itemLists[key];
	}

	createItem(id: any, name: any, extra: any) {
		return { name, value: id, ...extra };
	}

	createNoneItem() {
		return {
			name: this.localize?.get('common.none') ?? 'None',
			value: ''
		};
	}
}
