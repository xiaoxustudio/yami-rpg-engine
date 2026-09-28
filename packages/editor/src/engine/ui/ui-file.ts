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
		// 同 `load()` 里的 root/nodes/history：`meta` 的读取方已迁到 `getUIStore()`
		// （`ui-events.ts` 的 `File.planToSave!(this.meta)`、`usePresetElementWindow.ts:87`），
		// 只写 `this.meta` 会让它们永远读到 null。
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
		const nodes = this.nodes!;
		const length = nodes.length;
		for (let i = 0; i < length; i++) {
			// `this.root` 在上面几行刚由 `editor.root` 赋过（`ui-file.ts:81`）⇒ 此处非空
			this.loadElement!(nodes[i], this.root!);
		}
	} else {
		this.updateAllReferences!();
	}

	this.list.update();
	// this.list.scrollTop = editor.listScrollTop

	this.setTarget!(editor!.target);

	// `this.context` 同样是本函数开头那两行 `this.context = context` 定的；`load()` 就是「打开一份文档」
	// 的入口 ⇒ 这里非空（与 `getUIStore().state === 'open'` 是同一时刻的前提）。
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
		// `state === 'open'` 就是「有打开的文档」⇒ `this.context` 非空（`load()` 里赋值、`close()` 里置 null），
		// 而 `context.ui` / `context.editor` 同样是那一步建的（`load()` 开头 `if (firstLoad) context.editor = …`，
		// `open()` 里 `if (!context.ui) context.ui = Data.ui[meta.guid]` 且只有非空才走到这里）。
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
		// editor.listScrollTop = this.list.scrollTop
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
		// 故意不清 store 的 root/nodes/history：只在 load() 写入，关闭后保留旧值不会误导
		// 消费者（同一文件重开时 load() 的 else 分支会重新指向它），却能避免让调用方读到 null。
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
	// 销毁UI组件实例
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
	// `item.parent` 非空是不变式：快捷键只对画布树里的节点建（根节点不在列表里可选），
	// 而类型上根节点的 `parent` 是 `null`（见 `element-classes.ts` 的 `UINodeShape.parent`）。
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

/**
 * 本域提供的 15 个成员（第 ④-3 步：域模块只**提供**成员对象，装配见 `ui-members.ts`）。
 *
 * 本轮**只搬声明、不动函数体**（同第 173/179 轮）：体内 `UI.x` 原地保留 ⇒ 行为逐字不变、零风险；
 * `import { UI }` 暂时保留（伴随判据如实不降）。
 *
 * ⚠️ 槽位名 `delete` 是**保留字**，局部变量只能叫别的（`deleteSlot`），成员对象的**键**保持 `delete` ✓。
 */
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
