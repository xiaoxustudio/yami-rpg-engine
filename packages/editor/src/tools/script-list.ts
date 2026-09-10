/* oxlint-disable eslint/no-restricted-properties */
import { getListConfig, setTreeItemClass, treeOwnerListOf } from '@ui-kit';
import { File } from '@app/file/file-system-core.ts';
import { getSelectorInstance } from '@app/stores/selector.ts';
import { getBrowserInstance, getBrowserStore } from '@app/stores/browser.ts';
import { addClass, hasClass, removeClass } from '@app/utils/element-utils';
import { collect } from '@app/utils/event-scope';
import { Command } from '@app/commands/command-object.ts';
import { FileItem } from '@app/services/file-system/file-item.ts';
import { ParamHistory } from '@app/composables/useParamHistory';
import { PluginManager } from '@app/plugin/plugin.ts';
import { h, render } from 'vue';

import { IEditableHistory } from '@app/types/history.ts';
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

interface ScriptListElement {
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
	editor: { target?: ScriptListItem } | null = null;
	owner: { history?: unknown } | null = null;
	history: IEditableHistory | null = null;

	constructor(editor?: { target?: ScriptListItem }, owner?: unknown) {
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
			this.history = new ParamHistory(editor, owner, list) as unknown as IEditableHistory;
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
		const box = document.createElement('div');
		render(h('div', { class: 'box script-edit-button' }, '\uf044'), box);
		return [
			{ content: Command.removeTextTags(scriptName), class: scriptClass },
			box.firstElementChild as HTMLElement
		];
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
		(this.target as unknown as ScriptListTarget).save();
	}

	static listPointerdown = (function IIFE() {
		let element: HTMLElement | null = null;
		const once = { once: true };
		const pointerup = (event: PointerEvent) => {
			if (element && element.contains(event.target as Node)) {
				const el = element.parentNode as HTMLElement & {
					dataItem?: { id: string };
					item?: { id: string };
				};
				const item = el.dataItem ?? el.item;
				const path = File.getPath!(item.id);
				if (path) getBrowserStore().openScript?.(path);
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
			removeClass(this as unknown as HTMLElement, 'dragover');
		}
	}

	static listDragover(this: ScriptListElement, event: Event) {
		if (getBrowserInstance()?.dragging) {
			const file = getBrowserInstance()?.body?.activeFile;
			if (file instanceof FileItem && file.type === 'script') {
				(event as DragEvent).dataTransfer!.dropEffect = 'move';
				event.preventDefault();
				addClass(this as unknown as HTMLElement, 'dragover');
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
			removeClass(this as unknown as HTMLElement, 'dragover');
		}
	}
}
