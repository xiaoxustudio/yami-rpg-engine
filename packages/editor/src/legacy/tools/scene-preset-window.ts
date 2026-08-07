import { $ } from '@/util/dom.ts';
import { Window } from '@/tools/window-object.ts';
import { getFocus, read, write } from '@/util/element-utils';
import { Data } from '@/data/data-object.ts';
import { Scene } from '@/scene/scene-window.ts';

export const PresetObject = {
	scene: null as any,
	list: null as any,
	searcher: null as any,
	target: null as any,
	nodes: null as any,
	initialize: null as any,
	open: null as any,
	buildNodes: null as any,
	getDefaultPresetId: null as any,
	windowClosed: null as any,
	sceneIdWrite: null as any,
	listOpen: null as any,
	searcherKeydown: null as any,
	searcherInput: null as any,
	confirm: null as any
};

function ensureDomBound() {
	if (PresetObject.list) return;
	const list = $('#presetObject-list');
	if (!list) return;
	PresetObject.scene = $('#presetObject-sceneId');
	PresetObject.list = list;
	PresetObject.searcher = $('#presetObject-searcher');
	PresetObject.list.createIcon = null as unknown as (...args: unknown[]) => any;
}

PresetObject.initialize = function (this: any) {
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

PresetObject.open = function (this: any, target: any) {
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
	const build = (nodes: any, className: any) => {
		const list = [] as any[];
		for (const node of nodes) {
			if (node.class === 'folder') {
				list.push({
					class: node.class,
					name: node.name,
					expanded: node.expanded,
					children: build(node.children, className)
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
	return function (this: any, nodes: any, className: any) {
		return build(nodes, className);
	};
})();

PresetObject.getDefaultPresetId = function (this: any, className = 'any') {
	if (Scene.target && (className === 'any' || Scene.target.class === className)) {
		return Scene.target.presetId;
	}
	return '';
};

PresetObject.windowClosed = function (this: any, event: any) {
	PresetObject.target = null;
	PresetObject.nodes = null;
	PresetObject.searcher.write('');
	PresetObject.list.clear();
};

PresetObject.sceneIdWrite = function (this: any, event: any) {
	if (!event.value) return;
	const scene = Data.scenes[event.value];
	const filter = PresetObject.target.filter;
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

PresetObject.listOpen = function (this: any, event: any) {
	PresetObject.confirm();
};

PresetObject.searcherKeydown = function (this: any, event: any) {
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

PresetObject.searcherInput = function (this: any, event: any) {
	if (event.inputType === 'insertCompositionText') {
		return;
	}
	const text = this.input!.value;
	const list = PresetObject.list;
	list.searchNodes(text);
	const elements = list.elements;
	for (let i = 0; i < elements.count; i++) {
		const { item } = elements[i];
		if (item.class !== 'folder') {
			list.select(item);
			break;
		}
	}
};

PresetObject.confirm = function (this: any, event: any) {
	const node = this.list.read();
	const presetId = node?.presetId;
	if (!presetId) {
		return getFocus(this.list);
	}
	this.target?.input?.(presetId);
	Window.close!('presetObject');
}.bind(PresetObject);
