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
	const next = cur?.element?.nextSibling?.item;
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
