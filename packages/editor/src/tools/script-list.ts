import { getListConfig, setTreeItemClass, treeOwnerListOf } from '@ui-kit';
import { File } from '@app/file/file-system-core.ts';
import { getSelectorInstance } from '@app/stores/selector.ts';
import { getBrowserInstance, getBrowserStore } from '@app/stores/browser.ts';
import { addClass, hasClass, removeClass } from '@app/utils/element-utils';
import { elementDataOf } from '@app/utils/element-data';
import { collect } from '@app/utils/event-scope';
import { Command } from '@app/commands/command-object.ts';
import { FileItem } from '@app/services/file-system/file-item.ts';
import { ParamHistory } from '@app/composables/useParamHistory';
import { PluginManager } from '@app/plugin/plugin.ts';
import { h } from 'vue';
import { renderDetached } from '@app/utils/dom';

import { IUndoRedoHistory } from '@app/types/history.ts';
import { IScriptListInterface } from '@app/types/list-interface.ts';

interface ScriptData {
	id: string;
	enabled?: boolean;
	parameters?: Record<string, unknown>;
}

interface ScriptListItem {
	id: string;
	enabled?: boolean;
	element?: HTMLElement & {
		parentNode?: HTMLElement & { update: () => void };
	};
	scripts?: unknown[];
}

interface ScriptListTarget {
	save: () => void;
}

interface ScriptListElement extends HTMLElement {
	elements: HTMLElement[];
	read: () => ScriptListItem[];
	togglable?: boolean;
	addEventListener(type: string, listener: (event: Event) => void): void;
	contains(target: Node): boolean;
	object: { script: ScriptData | null };
	inserting?: boolean;
	focus: () => void;
	select: (n: number) => void;
	save: () => void;
	classList: DOMTokenList;
}

const listScopes = new WeakMap<ScriptListElement, { off(): void }>();

export class ScriptListInterface implements IScriptListInterface {
	target!: (HTMLElement & { [k: string]: unknown }) | null;
	type!: string;
	filter!: string;
	script: ScriptData | null = null;
	editor: { target?: ScriptListItem | null } | null = null;
	owner: { history?: unknown } | null = null;
	history: IUndoRedoHistory | null = null;

	constructor(editor?: { target?: ScriptListItem | null }, owner?: unknown) {
		this.editor = editor ?? null;
		this.owner = owner ?? null;
	}

	initialize(list: ScriptListElement & HTMLElement): void {
		getListConfig(list).togglable = true;
		this.target = null;
		this.script = null;
		this.filter = 'script';
		this.type = 'script';

		const { editor, owner } = this;
		if (editor && owner) {
			// ✅ 第 105 轮结案：这里原先写 `as unknown as IEditableHistory`，理由是
			// 「`ParamHistory` 结构上不满足 `IEditableHistory`（缺 `stack`/`index`）」。
			// 量到底的结论是**接口对这批消费方偏宽**：`ParamHistory` 是委托型适配器
			// （栈在 `owner.history` 上），而消费方只调用方法、从不读 `stack`/`index`。
			// 所以字段类型收窄成 `IUndoRedoHistory` 之后，单次赋值即可，断言彻底消失。
			this.history = new ParamHistory(editor, owner, list);
		}

		listScopes.get(list)?.off();
		const scope = collect(list);
		scope.on('pointerdown', ScriptListInterface.listPointerdown as EventListener);
		// oxlint-disable-next-line unbound-method
		scope.on('dragenter', ScriptListInterface.listDragenter as EventListener);
		// oxlint-disable-next-line unbound-method
		scope.on('dragleave', ScriptListInterface.listDragleave as EventListener);
		// oxlint-disable-next-line unbound-method
		scope.on('dragover', ScriptListInterface.listDragover as EventListener);
		// oxlint-disable-next-line unbound-method
		scope.on('drop', ScriptListInterface.listDrop as EventListener);
		listScopes.set(list, scope);
	}

	parse(script: ScriptData): unknown[] {
		Command.invalid = false;
		const scriptName = Command.parseFileName(script.id);
		const scriptClass = Command.invalid ? 'invalid' : script.enabled ? '' : 'weak';
		// P1b：离屏节点统一走 utils/dom 的 renderDetached（原先 document.createElement + render）
		const box = renderDetached(h('div', { class: 'box script-edit-button' }, '\uf044'));
		return [{ content: Command.removeTextTags(scriptName), class: scriptClass }, box];
	}

	update(list: ScriptListElement) {
		const items = list.read();
		const length = items.length;
		if (length !== 0) {
			const flags = {} as Record<string, boolean>;
			for (let i = length - 1; i >= 0; i--) {
				const { id } = items[i];
				if (flags[id]) {
					setTreeItemClass(items[i], 'weak', true);
				} else {
					flags[id] = true;
				}
			}
		}

		const item = this.editor?.target;
		if (item?.scripts === list.read()) {
			// 步骤 4：按 item 反查所属列表（不再依赖 element.parentNode）
			const owner = treeOwnerListOf(item) as { update?: () => void } | undefined;
			owner?.update?.();
		}
	}

	open(script: ScriptData = PluginManager.createData()) {
		this.script = script;
		getSelectorInstance()?.open?.(this, false);
	}

	save() {
		return this.script;
	}

	read() {
		return this.script!.id;
	}

	input(scriptId: string) {
		this.script!.id = scriptId;
		// 单个断言（不再用 `unknown` 换掉整张类型表）：`target` 是**带 `save()` 的元素**或 null。
		// 断言目标里保留 `| null` 才能与源类型（同样含 null）「可比」——这正是第 73 轮那条
		// 「不要为了好看把 `| null` 删掉」的规则在断言目标侧的同一件事；`!` 保持原来的空值语义。
		(this.target as (HTMLElement & ScriptListTarget) | null)!.save();
	}

	static listPointerdown = (function IIFE() {
		let element: HTMLElement | null = null;
		const once = { once: true };
		const pointerup = (event: PointerEvent) => {
			if (element && element.contains(event.target as Node)) {
				const el = element.parentNode as HTMLElement | null;
				if (el !== null) {
					// 兼容两种列表（legacy 注释："临时兼容ParamList和TreeList"）：
					// ParamList 行把 `dataItem` 作为 own 属性挂在元素上；TreeList 行的 `item` 在 P4b
					// 之后走**元素数据**（元素属性 `item` 已退役）——按属性读会拿到 undefined，
					// 随后 `item.id` 直接抛错（点脚本行的编辑按钮时爆）。
					const item =
						(el as { dataItem?: ScriptListItem }).dataItem ??
						elementDataOf<{ item?: ScriptListItem }>(el).item;
					const path = item ? File.getPath!(item.id) : undefined;
					if (path) getBrowserStore().openScript?.(path);
				}
			}
			element = null;
		};
		return function (event: PointerEvent) {
			if (event.button === 0 && hasClass(event.target, 'box')) {
				element = event.target as HTMLElement;
				// 自动过滤重复侦听器，无需额外检查
				window.addEventListener('pointerup', pointerup, once);
			}
		};
	})();

	static listDragenter(this: ScriptListElement, event: Event) {
		return ScriptListInterface.listDragover.call(this, event as DragEvent);
	}

	static listDragleave(this: ScriptListElement, event: Event) {
		if (!this.contains((event as DragEvent).relatedTarget as Node)) {
			removeClass(this, 'dragover');
		}
	}

	static listDragover(this: ScriptListElement, event: Event) {
		if (getBrowserInstance()?.dragging) {
			const file = getBrowserInstance()?.body?.activeFile;
			if (file instanceof FileItem && file.type === 'script') {
				(event as DragEvent).dataTransfer!.dropEffect = 'move';
				event.preventDefault();
				addClass(this, 'dragover');
			}
		}
	}

	static listDrop(this: ScriptListElement, _event: Event) {
		const file = getBrowserInstance()?.body?.activeFile;
		if (file instanceof FileItem) {
			const script = PluginManager.createData();
			script.id = file.meta!.guid;
			this.object.script = script;
			this.inserting = true;
			this.focus();
			this.select(Infinity);
			this.save();
			removeClass(this, 'dragover');
		}
	}
}
