import { UI } from './legacy/ui-window.ts';
import type { UIShape, UIContextShape, UINodeShape } from './legacy/ui-window.ts';
import { Data } from '@app/data/data-object.ts';
import { Particle } from '@app/particle/particle-window.ts';
import { getUIStore } from '@app/stores/ui';
import { clear, hide, show, write } from '@app/utils/element-utils.ts';
import { Layout } from '@app/engine/layout/layout.ts';
import { Window } from '@app/tools/window-object.ts';
import { History } from '@app/tools/history.ts';
import { uiElClasses } from '@app/engine/ui/element-classes.ts';
import { UndoManager } from '@app/tools/undo-manager.ts';
import { Inspector } from '@app/inspector/inspector.ts';
import { TreeList } from '@app/components/tree-list.ts';

UI.open = function (this: UIShape, context: UIContextShape) {
	if (this.context === context) {
		return;
	}
	this.save!();
	this.close!();

	Particle.Element.stage = this;

	const { meta } = context;
	if (!context.ui) {
		context.ui = Data.ui[meta.guid];
	}
	if (context.ui) {
		getUIStore().state = 'open';
		this.context = context;
		this.meta = meta;
		// 同 `load()` 里的 root/nodes/history：`meta` 的读取方已迁到 `getUIStore()`
		// （`ui-events.ts` 的 `File.planToSave!(this.meta)`、`usePresetElementWindow.ts:87`），
		// 只写 `this.meta` 会让它们永远读到 null。
		getUIStore().meta = meta;
		show(this.body);
		this.load!(context);
		this.resize!();
		this.requestRendering!();
	} else {
		Layout.manager.switch('directory');
		Window.confirm!(
			{
				message: `Failed to read file: ${meta.path}`
			},
			[
				{
					label: 'Confirm'
				}
			]
		);
	}
};

UI.load = function (this: UIShape, context: UIContextShape) {
	const firstLoad = !context.editor;
	if (firstLoad) {
		context.editor = {
			target: null,
			root: new uiElClasses.Root!(),
			history: new History(100),
			centerX: context.ui!.width / 2,
			centerY: context.ui!.height / 2
			// listScrollTop: 0,
		};
	}
	const { ui, editor } = context;

	getUIStore().width = ui!.width;
	getUIStore().height = ui!.height;
	this.nodes = ui!.nodes;
	// ⚠️ root / nodes / history 必须**同时**写 store：读取方（reference-element / element-base /
	// ui-engine / inspector 共 15 处）已迁到 `getUIStore()`，而 store 里的 shallowRef 没有别的
	// 写入点。只写 `this.x` 会让它们永远是 null —— 打开 UI 文件时
	// `getUIStore().root!.addReference(...)` 直接抛错（2026-09-18）。
	// `nodes` 用同一数组实例（TreeList 的 `bind` 绑的是 `this.nodes`，两者必须同源）。
	this.nodes = getUIStore().nodes = this.nodes;

	this.root = editor!.root;
	this.history = editor!.history;
	getUIStore().root = this.root;
	getUIStore().history = this.history;
	this.centerX = editor!.centerX;
	this.centerY = editor!.centerY;

	if (firstLoad) {
		const nodes = this.nodes;
		const length = nodes.length;
		for (let i = 0; i < length; i++) {
			this.loadElement!(nodes[i], this.root);
		}
	} else {
		this.updateAllReferences!();
	}

	this.list.update();
	// this.list.scrollTop = editor.listScrollTop

	this.setTarget!(editor!.target);

	if (this.context.fontChanged) {
		this.updateElementFont!();
	}

	if (this.context.languageChanged) {
		this.updateElementLanguage!();
	}

	if (this.context.scalingChanged) {
		this.updateElementTextScaling!();
	}

	UndoManager.setActive!(UI);
};

UI.save = function (this: UIShape) {
	if (getUIStore().state === 'open') {
		const { ui, editor } = this.context;

		ui.width = getUIStore().width!;
		ui.height = getUIStore().height!;
		ui.nodes = this.nodes;

		editor.target = getUIStore().target;
		editor.root = this.root;
		editor.history = this.history;
		editor.centerX = this.centerX;
		editor.centerY = this.centerY;
		// editor.listScrollTop = this.list.scrollTop
	}
};

UI.close = function (this: UIShape) {
	if (getUIStore().state !== 'closed') {
		this.screen.blur();
		if (Inspector.type === 'fileUI') {
			Inspector.close!();
		}
		this.setTarget!(null);
		getUIStore().state = 'closed';
		this.context = null;
		this.meta = null;
		getUIStore().meta = null;
		this.nodes = null;
		this.history = null;
		this.root = null;
		// 故意不清 store 的 root/nodes/history：只在 load() 写入，关闭后保留旧值不会误导
		// 消费者（同一文件重开时 load() 的 else 分支会重新指向它），却能避免让调用方读到 null。
		write(this.searcher, '');
		clear(this.list);
		hide(this.body);
		this.stopRendering!();
		UndoManager.setActive!(null);
	}
};

UI.destroy = function (this: UIShape, context: UIContextShape) {
	if (!context.editor) return;
	if (this.context === context) {
		this.save!();
		this.close!();
	}
	// 销毁UI组件实例
	context.editor.root!.destroy();
	TreeList.deleteCaches!(context.ui!.nodes as Parameters<typeof TreeList.deleteCaches>[0]);
};

UI.copy = function (this: UIShape) {
	if (getUIStore().state === 'open' && getUIStore().target !== null) {
		this.list.copy(getUIStore().target);
	}
};

UI.paste = function (this: UIShape, x?: number, y?: number) {
	if (getUIStore().state === 'open' && this.dragging === null) {
		if (x === undefined) {
			x = this.centerX;
			y = this.centerY;
		}
		this.list.paste(null, (data: { transform: { x: number; y: number } }) => {
			const { transform } = data;
			transform.x = Math.round(x!);
			transform.x = 0;
			transform.y = Math.round(y!);
			transform.y = 0;
		});
	}
};

UI.duplicate = function (this: UIShape) {
	if (getUIStore().target) {
		this.list.duplicate(getUIStore().target);
	}
};

UI.create = function (this: UIShape, kind: string, x: number, y: number) {
	const map = this.inspectorTypeMap;
	const key = map[kind];
	const editor = Inspector[key];
	const node = editor.create();
	node.transform.x = x;
	node.transform.y = y;
	this.list.addNodeTo(node);
};

UI.createPrefab = function (
	this: UIShape,
	prefab: {
		name: string;
		presetId: string;
		transform: { x: number; y: number; [k: string]: unknown };
		[k: string]: unknown;
	},
	parent: UINodeShape | null,
	x?: number,
	y?: number
) {
	const reference = Inspector.uiReference.create!();
	reference.name = prefab.name;
	reference.prefabId = prefab.presetId;
	reference.synchronous = true;
	reference.transform = { ...prefab.transform };
	if (typeof x === 'number') {
		reference.transform.x = x;
		reference.transform.x2 = 0;
	}
	if (typeof y === 'number') {
		reference.transform.y = y;
		reference.transform.y2 = 0;
	}
	this.list.addNodeTo(reference, parent);
};

UI.createShortcut = function (this: UIShape, item: UINodeShape) {
	const reference = Inspector.uiReference.create!();
	reference.name = this.list.generateUniqueName(item);
	reference.prefabId = item.presetId;
	reference.synchronous = true;
	reference.transform = { ...item.transform };
	const index = item.parent.children.indexOf(item);
	const next = item.parent.children[index + 1];
	if (next) {
		this.list.addNodeTo(reference, next, true);
	} else {
		this.list.addNodeTo(reference, item.parent);
	}
};

UI.delete = function (this: UIShape) {
	if (getUIStore().state === 'open' && getUIStore().target !== null && this.dragging === null) {
		this.list.delete(getUIStore().target);
	}
};

UI.toggle = function (this: UIShape) {
	this.list.toggle(getUIStore().target);
};

UI.undo = function (this: UIShape) {
	if (getUIStore().state === 'open' && !this.dragging && this.history?.canUndo()) {
		this.history.restore('undo');
		this.marquee.resize();
	}
};

UI.redo = function (this: UIShape) {
	if (getUIStore().state === 'open' && !this.dragging && this.history?.canRedo()) {
		this.history.restore('redo');
		this.marquee.resize();
	}
};
