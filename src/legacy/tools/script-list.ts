import { File } from '@/file/file-system-core.ts';
import { addClass, removeClass } from '@/util/element-utils';
import { Command } from '@/command/command-object.ts';
import { TreeList } from '@/components/tree-list.ts';
import { FileItem } from '@/file/file-item.ts';
import { Inspector } from '@/inspector/inspector.ts';
import { PluginManager } from '@/plugin/plugin.ts';

import { IScriptListInterface } from '@/types/list-interface.ts';

export class ScriptListInterface implements IScriptListInterface {
	target: (HTMLElement & { [k: string]: any }) | null;
	type: string;
	filter: string;
	script: any | null;
	editor: any | null;
	owner: any | null;
	history: any | null;

	constructor(editor?: any, owner?: any) {
		this.editor = editor ?? null;
		this.owner = owner ?? null;
	}

	initialize(list: any): void {
		list.togglable = true;
		this.target = null;
		this.script = null;
		this.filter = 'script';
		this.type = 'script';

		const { editor, owner } = this;
		if (editor && owner) {
			this.history = new Inspector.ParamHistory(editor, owner, list);
		}

		list.addEventListener('pointerdown', ScriptListInterface.listPointerdown);
		list.addEventListener('dragenter', ScriptListInterface.listDragenter);
		list.addEventListener('dragleave', ScriptListInterface.listDragleave);
		list.addEventListener('dragover', ScriptListInterface.listDragover);
		list.addEventListener('drop', ScriptListInterface.listDrop);
	}

	parse(script: any): any {
		const box = document.createElement('box');
		box.textContent = '\uf044';
		addClass(box, 'script-edit-button');
		Command.invalid = false;
		const scriptName = Command.parseFileName(script.id);
		const scriptClass = Command.invalid ? 'invalid' : script.enabled ? '' : 'weak';
		return [{ content: Command.removeTextTags(scriptName), class: scriptClass }, box];
	}

	update(list: any) {
		const elements = list.elements;
		const items = list.read();
		const length = items.length;
		if (length !== 0) {
			const flags = {};
			for (let i = length - 1; i >= 0; i--) {
				const { id } = items[i];
				if (flags[id]) {
					addClass(elements[i], 'weak');
				} else {
					flags[id] = true;
				}
			}
		}

		const item = this.editor?.target;
		if (item?.scripts === list.read()) {
			const element = item.element;
			const list = element?.parentNode;
			if (list instanceof TreeList) {
				(list as any).updateScriptIcon(item);
			}
		}
	}

	open(script = PluginManager.createData()) {
		this.script = script;
		(window as any).Selector?.open?.(this, false);
	}

	save() {
		return this.script;
	}

	read() {
		return this.script.id;
	}

	input(scriptId: any) {
		this.script.id = scriptId;
		this.target.save();
	}

	static listPointerdown = (function IIFE() {
		let element = null;
		const once = { once: true };
		const pointerup = (event) => {
			if (element.contains(event.target)) {
				const el = element.parentNode;
				const item = el.dataItem ?? el.item;
				const path = File.getPath(item.id);
				if (path) (window as any).Browser?.openScript?.(path);
			}
			element = null;
		};
		return function (event) {
			if (event.button === 0 && event.target.tagName === 'BOX') {
				element = event.target;
				// 自动过滤重复侦听器，无需额外检查
				window.addEventListener('pointerup', pointerup, once);
			}
		};
	})();

	static listDragenter(event: any) {
		return ScriptListInterface.listDragover.call(this, event);
	}

	static listDragleave(event: any) {
		const self: any = this;
		if (!self.contains(event.relatedTarget)) {
			removeClass(self, 'dragover');
		}
	}

	static listDragover(event: any) {
		if ((window as any).Browser?.dragging) {
			const file = (window as any).Browser?.body?.activeFile;
			if (file instanceof FileItem && file.type === 'script') {
				event.dataTransfer.dropEffect = 'move';
				event.preventDefault();
				addClass(this as any, 'dragover');
			}
		}
	}

	static listDrop(event: any) {
		const file = (window as any).Browser?.body?.activeFile;
		if (file instanceof FileItem) {
			const script = PluginManager.createData();
			script.id = file.meta.guid;
			const self: any = this;
			self.object.script = script;
			self.inserting = true;
			self.focus();
			self.select(Infinity);
			self.save();
			removeClass(self, 'dragover');
		}
	}
}
