export const commonListClearElements = (list: any, start: number): void => {
	let i = start;
	while (list.elements[i] !== undefined) {
		list.elements[i++] = undefined;
	}
};

export const commonListUpdateHeadAndFoot = (list: any): void => {
	const el = list;
	if (list.elements.head) {
		list.elements.head.style.marginTop = '';
		list.elements.head = null;
	}
	if (list.elements.foot) {
		list.elements.foot.style.marginBottom = '';
		list.elements.foot = null;
	}
	const { count, start, end } = list.elements;
	if (count !== 0) {
		const pad = el.padded ? 1 : 0;
		const mt = start * 20;
		const mb = (count - end + pad) * 20;
		list.elements.head = list.elements[start];
		list.elements.head!.style.marginTop = `${mt}px`;
		list.elements.foot = list.elements[end - 1];
		list.elements.foot!.style.marginBottom = `${mb}px`;
	}
};

export const commonListResize = (list: any): void => {
	const el = list;
	const st = el.scrollTop;
	const ch = el.clientHeight;
	const count = list.elements.count;
	if (ch === 0) return;
	if (count === 0) {
		el.textContent = '';
		return;
	}
	const start = Math.min(Math.floor(st / 20), count - 1);
	const length = Math.ceil(ch / 20) + 1;
	const end = Math.min(start + length, count);
	if (list.elements.start !== start || list.elements.end !== end) {
		list.elements.start = start;
		list.elements.end = end;
		commonListUpdateHeadAndFoot(list);
		const versionId = list.elements.versionId++;
		for (let i = start; i < end; i++) {
			const element = list.elements[i];
			element.versionId = versionId;
			list.updateOnResize(element);
		}
		const nodes = el.childNodes;
		const last = nodes.length - 1;
		for (let i = last; i >= 0; i--) {
			const element = nodes[i];
			if (element.versionId !== versionId) {
				element.remove();
			}
		}
		if (list.elements.foot && !list.elements.foot.parentNode) {
			el.appendChild(list.elements.foot);
		}
		for (let i = end - 2; i >= start; i--) {
			const element = list.elements[i];
			if (element.parentNode === null) {
				const next = list.elements[i + 1];
				el.insertBefore(element, next);
			}
		}
	}
};
