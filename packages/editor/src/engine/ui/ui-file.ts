import { UI } from './ui-singleton.ts';
import type { UIShape, UIContextShape, UINodeShape } from './ui-singleton.ts';
import { UIEngine } from './ui-engine.ts';
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

const open = function (this: UIShape, context: UIContextShape) {
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
		getUIStore().meta = meta;
		show(this.body);
		this.load!(context);
		this.resize!();
		UIEngine.requestRendering!.call(this);
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

const load = function (this: UIShape, context: UIContextShape) {
	const firstLoad = !context.editor;
	if (firstLoad) {
		context.editor = {
			target: null,
			root: new uiElClasses.Root!(),
			history: new History(100),
			centerX: context.ui!.width / 2,
			centerY: context.ui!.height / 2
		};
	}
	const { ui, editor } = context;

	getUIStore().width = ui!.width;
	getUIStore().height = ui!.height;
	this.nodes = ui!.nodes;
	this.nodes = getUIStore().nodes = this.nodes;

	this.root = editor!.root;
	this.history = editor!.history;
	getUIStore().root = this.root;
	getUIStore().history = this.history;
	this.centerX = editor!.centerX;
	this.centerY = editor!.centerY;

	if (firstLoad) {
		const nodes = this.nodes!;
		const length = nodes.length;
		for (let i = 0; i < length; i++) {
			this.loadElement!(nodes[i], this.root!);
		}
	} else {
		this.updateAllReferences!();
	}

	this.list.update();

	this.setTarget!(editor!.target);

	if (this.context!.fontChanged) {
		this.updateElementFont!();
	}

	if (this.context!.languageChanged) {
		this.updateElementLanguage!();
	}

	if (this.context!.scalingChanged) {
		this.updateElementTextScaling!();
	}

	UndoManager.setActive!(UI);
};

const save = function (this: UIShape) {
	if (getUIStore().state === 'open') {
		const context = this.context!;
		const ui = context.ui!;
		const editor = context.editor!;

		ui.width = getUIStore().width!;
		ui.height = getUIStore().height!;
		ui.nodes = this.nodes!;

		editor.target = getUIStore().target;
		editor.root = this.root;
		editor.history = this.history!;
		editor.centerX = this.centerX;
		editor.centerY = this.centerY;
	}
};

const close = function (this: UIShape) {
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
		write(this.searcher, '');
		clear(this.list);
		hide(this.body);
		UIEngine.stopRendering!.call(this);
		UndoManager.setActive!(null);
	}
};

const destroy = function (this: UIShape, context: UIContextShape) {
	if (!context.editor) return;
	if (this.context === context) {
		this.save!();
		this.close!();
	}
	context.editor.root!.destroy();
	TreeList.deleteCaches!(context.ui!.nodes as Parameters<typeof TreeList.deleteCaches>[0]);
};

const copy = function (this: UIShape) {
	if (getUIStore().state === 'open' && getUIStore().target !== null) {
		this.list.copy(getUIStore().target);
	}
};

const paste = function (this: UIShape, x?: number, y?: number) {
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

const duplicate = function (this: UIShape) {
	if (getUIStore().target) {
		this.list.duplicate(getUIStore().target);
	}
};

const create = function (this: UIShape, kind: string, x: number, y: number) {
	const map = this.inspectorTypeMap;
	const key = map[kind];
	const editor = Inspector[key];
	const node = editor.create();
	node.transform.x = x;
	node.transform.y = y;
	this.list.addNodeTo(node);
};

const createPrefab = function (
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

const createShortcut = function (this: UIShape, item: UINodeShape) {
	const reference = Inspector.uiReference.create!();
	reference.name = this.list.generateUniqueName(item);
	reference.prefabId = item.presetId;
	reference.synchronous = true;
	reference.transform = { ...item.transform };
	const index = item.parent!.children.indexOf(item);
	const next = item.parent!.children[index + 1];
	if (next) {
		this.list.addNodeTo(reference, next, true);
	} else {
		this.list.addNodeTo(reference, item.parent!);
	}
};

const deleteSlot = function (this: UIShape) {
	if (getUIStore().state === 'open' && getUIStore().target !== null && this.dragging === null) {
		this.list.delete(getUIStore().target);
	}
};

const toggle = function (this: UIShape) {
	this.list.toggle(getUIStore().target);
};

const undo = function (this: UIShape) {
	if (getUIStore().state === 'open' && !this.dragging && this.history?.canUndo()) {
		this.history.restore('undo');
		this.marquee.resize();
	}
};

const redo = function (this: UIShape) {
	if (getUIStore().state === 'open' && !this.dragging && this.history?.canRedo()) {
		this.history.restore('redo');
		this.marquee.resize();
	}
};

export const uiFileMembers = {
	open: open,
	load: load,
	save: save,
	close: close,
	destroy: destroy,
	copy: copy,
	paste: paste,
	duplicate: duplicate,
	create: create,
	createPrefab: createPrefab,
	createShortcut: createShortcut,
	delete: deleteSlot,
	toggle: toggle,
	undo: undo,
	redo: redo
};
