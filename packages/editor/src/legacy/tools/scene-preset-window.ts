import { $ } from '@/util/dom.ts';
import { Window } from '@/tools/window-object.ts';
import { getFocus, read, write } from '@/util/element-utils';
import { Data } from '@/data/data-object.ts';
import { Scene } from '@/scene/scene-window.ts';

type PresetNode = {
	class: string;
	name: string;
	expanded?: boolean;
	children?: PresetNode[];
	presetId?: string;
	teamId?: string;
	color?: string;
	red?: number;
	green?: number;
	blue?: number;
	image?: string;
};

interface PresetListItem {
	class: string;
	presetId?: string;
	teamId?: string;
}

interface PresetListElement extends HTMLElement {
	elements: Array<{ item: PresetListItem }>;
	createIcon: (...args: unknown[]) => unknown;
	bind(getter: () => PresetNode[] | null): void;
	clear(): void;
	update(): void;
	unselect(): void;
	select(item: PresetListItem): void;
	selectRelative(direction: string): void;
	pageUp(select: boolean): void;
	pageDown(select: boolean): void;
	scrollToSelection(mode: string): void;
	expandToSelection(): void;
	getItemByProperties(properties: Record<string, unknown>): PresetListItem | undefined;
	searchNodes(text: string): void;
	read(): PresetNode | null;
}

type PresetTarget = {
	filter: string;
	input?: (presetId: string) => void;
};

export const PresetObject = {
	scene: null as unknown as HTMLElement,
	list: null as unknown as PresetListElement,
	searcher: null as unknown as HTMLElement,
	target: null as unknown as PresetTarget | null,
	nodes: null as unknown as PresetNode[] | null,
	initialize: null as unknown as (...args: unknown[]) => any,
	open: null as unknown as ((target: PresetTarget) => void) | null,
	buildNodes: null as unknown as (...args: unknown[]) => PresetNode[],
	getDefaultPresetId: null as unknown as (...args: unknown[]) => string,
	windowClosed: null as unknown as (event: Event) => void,
	sceneIdWrite: null as unknown as (event: Event & { value?: string }) => void,
	listOpen: null as unknown as (event: Event) => void,
	searcherKeydown: null as unknown as (event: KeyboardEvent) => void,
	searcherInput: null as unknown as (event: InputEvent) => void,
	confirm: null as unknown as (event?: Event) => void
};

function ensureDomBound() {
	if (PresetObject.list) return;
	const list = $('#presetObject-list');
	if (!list) return;
	PresetObject.scene = $('#presetObject-sceneId');
	PresetObject.list = list as PresetListElement;
	PresetObject.searcher = $('#presetObject-searcher');
	PresetObject.list.createIcon = null as unknown as (...args: unknown[]) => any;
}

PresetObject.initialize = function (this: typeof PresetObject) {
	ensureDomBound();
	if (!this.list) return;
	this.list.bind(() => this.nodes);

	// 列表 - 重写创建图标方法
	this.list.createIcon = Scene.list.createIcon;

	this.searcher.addCloseButton();

	// scene write/list open 经 Vue 模板转发（PresetObject.vue @write/@open → PresetObject.*）
	this.searcher.on('keydown', this.searcherKeydown);
	this.searcher.on('input', this.searcherInput);
	this.searcher.on('compositionend', this.searcherInput);
	$('#presetObject').addEventListener('closed', this.windowClosed);
	$('#presetObject-confirm').addEventListener('click', this.confirm);
};

PresetObject.open = function (this: typeof PresetObject, target: PresetTarget) {
	this.target = target;
	Window.open!('presetObject');

	const { scene, list } = this;
	const presetId = read(target) || (Scene.target?.presetId ?? '');
	const sceneId = Data.scenePresets[presetId]?.sceneId ?? Scene.meta?.guid ?? '';
	write(scene, sceneId);
	getFocus(scene);
	const item = list.getItemByProperties({ presetId });
	if (item) {
		list.select(item);
		list.expandToSelection();
		list.scrollToSelection('middle');
	}
};

// 构造简化的对象节点(避免影响对象数据)
PresetObject.buildNodes = (function IIFE() {
	const build = (nodes: PresetNode[], className: string) => {
		const list: PresetNode[] = [];
		for (const node of nodes) {
			if (node.class === 'folder') {
				list.push({
					class: node.class,
					name: node.name,
					expanded: node.expanded,
					children: build(node.children ?? [], className)
				});
				continue;
			}
			if (className === 'any' || node.class === className) {
				list.push({
					class: node.class,
					name: node.name,
					presetId: node.presetId,
					teamId: node.teamId ?? '',
					color: node.color ?? '',
					red: node.red ?? 0,
					green: node.green ?? 0,
					blue: node.blue ?? 0,
					image: node.image ?? ''
				});
			}
		}
		return list;
	};
	return function (this: typeof PresetObject, ...args: unknown[]) {
		const nodes = args[0] as PresetNode[];
		const className = args[1] as string;
		return build(nodes, className);
	};
})();

PresetObject.getDefaultPresetId = function (this: typeof PresetObject, className = 'any') {
	if (Scene.target && (className === 'any' || Scene.target.class === className)) {
		return Scene.target.presetId;
	}
	return '';
};

PresetObject.windowClosed = function (this: typeof PresetObject, event: Event) {
	PresetObject.target = null;
	PresetObject.nodes = null;
	PresetObject.searcher.write!('');
	PresetObject.list.clear();
};

PresetObject.sceneIdWrite = function (
	this: typeof PresetObject,
	event: Event & { value?: string }
) {
	if (!event.value) return;
	const scene = Data.scenes[event.value];
	const filter = PresetObject.target!.filter;
	const nodes = scene ? PresetObject.buildNodes(scene.objects, filter) : Array.empty;
	PresetObject.nodes = nodes;
	PresetObject.list.update();
	if (nodes.length !== 0) {
		PresetObject.list.select(nodes[0]);
		PresetObject.list.scrollTop = 0;
	} else {
		PresetObject.list.unselect();
	}
};

PresetObject.listOpen = function (this: typeof PresetObject, event: Event) {
	PresetObject.confirm();
};

PresetObject.searcherKeydown = function (this: typeof PresetObject, event: KeyboardEvent) {
	switch (event.code) {
		case 'ArrowUp':
		case 'ArrowDown':
			event.preventDefault();
			PresetObject.list.selectRelative(event.code.slice(5).toLowerCase());
			break;
		case 'PageUp':
			PresetObject.list.pageUp(true);
			break;
		case 'PageDown':
			PresetObject.list.pageDown(true);
			break;
	}
};

PresetObject.searcherInput = function (this: typeof PresetObject, event: InputEvent) {
	if (event.inputType === 'insertCompositionText') {
		return;
	}
	const text = this.searcher.value;
	const list = PresetObject.list;
	list.searchNodes(text);
	const elements = list.elements as any[] & { count: number };
	for (let i = 0; i < elements.count; i++) {
		const { item } = elements[i];
		if (item.class !== 'folder') {
			list.select(item);
			break;
		}
	}
};

PresetObject.confirm = function (this: typeof PresetObject, event?: Event) {
	const node = this.list.read();
	const presetId = node?.presetId;
	if (!presetId) {
		return getFocus(this.list);
	}
	this.target?.input?.(presetId);
	Window.close!('presetObject');
}.bind(PresetObject);
