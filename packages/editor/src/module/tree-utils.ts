import { treeOwnerListOf, treeRowIndexOf, treeRowItemAt } from '@ui-kit';

interface SelectionItem {
	class?: string;
	parent?: SelectionItem;
	element?: { nextSibling?: { item?: SelectionItem } } & HTMLElement;
}

export function find_dItem(
	this: unknown,
	fn: (dItem?: SelectionItem, insertBefore?: boolean) => unknown
) {
	const self = this as { selections?: SelectionItem[] };
	const list = self.selections || [];
	const cur = list[list.length - 1];
	// 步骤 4：后继行经行 API 取得（渲染模式无关；命令式路径回退 elements/DOM）
	const owner = cur === undefined ? undefined : treeOwnerListOf(cur);
	const index = owner === undefined ? -1 : treeRowIndexOf(owner, cur);
	const next = index === -1 ? undefined : treeRowItemAt<SelectionItem>(owner, index + 1);
	let insertBefore = false;

	if (!cur) {
		return fn();
	}
	if (cur.class == 'folder') {
		return fn(cur);
	}
	if (!next) {
		if (cur.parent?.class == 'folder') {
			return fn(cur.parent);
		}
		return fn();
	}

	if (next.parent == cur.parent) {
		if (next.class == 'folder') {
			insertBefore = true;
		}
		return fn(next, insertBefore);
	} else {
		return fn(cur.parent);
	}
}
