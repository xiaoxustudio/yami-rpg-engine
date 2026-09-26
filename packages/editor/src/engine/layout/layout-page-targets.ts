// 运行时页面归属收集
// 遍历 group DOM 树，收集每个 page-frame 当前归属的 manager 元素：
// map[value] = 包含该 page-frame 的叶子 group-manager。收敛点（loadLayoutScheme/navDrop）
// 后由 layout.ts 同步进 store，供页面 Teleport 作 :to 输入。

type GroupShape = HTMLElement & { manager?: HTMLElement };

const isGroup = (el: Element): boolean => el.classList.contains('group');

const isPageFrame = (el: Element): boolean => el.classList.contains('page-frame');

export function collectPageTargets(root: Element | null): Record<string, HTMLElement> {
	const map: Record<string, HTMLElement> = {};
	if (root === null) return map;
	const walk = (el: Element): void => {
		const shape = el as GroupShape;
		if (shape.manager !== undefined) {
			for (const child of Array.from(shape.manager.children)) {
				if (!isPageFrame(child)) continue;
				const value = child.getAttribute('value');
				if (value !== null && value !== '') map[value] = shape.manager;
			}
		}
		for (const child of Array.from(el.children)) {
			if (isGroup(child)) walk(child);
		}
	};
	walk(root);
	return map;
}
