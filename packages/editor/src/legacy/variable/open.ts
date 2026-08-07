import { $ } from '@/util/dom.ts';
import { Window } from '@/tools/window-object.ts';
import { getFocus, read } from '@/util/element-utils.ts';
import { Data } from '@/data/data-object.ts';
import { File } from '@/file/file-system-core.ts';
import { Reference } from '@/log/related-references.ts';
import { History } from '@/tools/history.ts';
import { UndoManager } from '@/tools/undo-manager.ts';

import { Variable } from './variable.ts';

Variable.open = function (this: any, target: any = null) {
	this.target = target;
	(this as any)._previousActive = UndoManager.getActive();
	this.history = new History(100);
	UndoManager.setActive(this);
	this.unpackVariables();
	Window.open!('variable');

	const list = this.list;
	const item = !target ? undefined : this.getVariableById(read(target as any));
	if (item && item.class !== 'folder') {
		list.initialize();
		list.select(item);
		list.expandToSelection(false);
		list.update();
		list.restoreScroll();
		list.scrollToSelection('middle');
	} else {
		list.update();
		list.restoreScroll();
		if ((target as any) instanceof Object) {
			list.select(list.data[0]);
		}
	}

	getFocus(list);

	window.addEventListener('keydown', this.keydown);
	window.addEventListener('keydown', (Reference.getKeydownListener as any)(list, 'variable'));
};

Variable.undo = function (this: any) {
	if (this.history.canUndo()) {
		this.history.restore('undo');
	}
};

Variable.redo = function (this: any) {
	if (this.history.canRedo()) {
		this.history.restore('redo');
	}
};

Variable.confirm = function (this: any, event: any) {
	const target = this.target;
	if (target instanceof Object) {
		const variable = this.panel.variable;
		if (variable === null) {
			return getFocus(this.list);
		}
		const filter = target.filter;
		switch (filter) {
			case 'boolean':
			case 'number':
			case 'string':
			case 'object':
				if (typeof variable.value !== filter) {
					return getFocus($(`#variable-type-${filter}`));
				}
				break;
		}
		this.apply();
		target?.input?.(variable.id);
	} else {
		this.apply();
	}
	Window.close!('variable');
}.bind(Variable);

Variable.apply = function (this: any, event: any) {
	if (this.changed) {
		this.changed = false;

		this.packVariables();
		(File.planToSave as any)(Data.manifest.project.variables);

		window.dispatchEvent(new Event('variablechange'));
	}
}.bind(Variable);
