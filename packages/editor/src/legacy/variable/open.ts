import { $ } from '@/util/dom.ts';
import { Window } from '@/tools/window-object.ts';
import { getFocus, read } from '@/util/element-utils.ts';
import { Data } from '@/data/data-object.ts';
import { File } from '@/file/file-system-core.ts';
import { Reference } from '@/log/related-references.ts';
import { History } from '@/tools/history.ts';
import { UndoManager } from '@/tools/undo-manager.ts';

import { Variable } from './variable.ts';

Variable.open = function (this: typeof Variable, target: unknown = null) {
	this.target = target as { getFocus?: () => unknown } | null;
	this._previousActive = UndoManager.getActive();
	this.history = new History(100);
	UndoManager.setActive(this);
	this.unpackVariables!();
	Window.open!('variable');

	const list = this.list;
	const item = !target
		? undefined
		: (this.getVariableById!(read(target)) as { class?: string } | undefined);
	if (item && (item as { class?: string }).class !== 'folder') {
		list.initialize();
		list.select(item);
		list.expandToSelection(false);
		list.update();
		list.restoreScroll();
		list.scrollToSelection('middle');
	} else {
		list.update();
		list.restoreScroll();
		if (target instanceof Object) {
			list.select(list.data[0]);
		}
	}

	getFocus(list);

	window.addEventListener('keydown', this.keydown!);
	window.addEventListener('keydown', Reference.getKeydownListener!(list, 'variable'));
};

Variable.undo = function (this: typeof Variable) {
	if (this.history.canUndo()) {
		this.history.restore('undo');
	}
};

Variable.redo = function (this: typeof Variable) {
	if (this.history.canRedo()) {
		this.history.restore('redo');
	}
};

Variable.confirm = function (this: typeof Variable, event?: Event) {
	const target = this.target;
	if (target instanceof Object) {
		const variable = this.panel.variable;
		if (variable === null) {
			return getFocus(this.list);
		}
		const filter = (target as { filter?: string }).filter;
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
		this.apply!(undefined as unknown as Event);
		(target as { input?: (value: unknown) => void }).input?.(variable.id);
	} else {
		this.apply!(undefined as unknown as Event);
	}
	Window.close!('variable');
}.bind(Variable);

Variable.apply = function (this: typeof Variable, event: Event) {
	if (this.changed) {
		this.changed = false;

		this.packVariables!();
		File.planToSave!(Data.manifest.project.variables);

		window.dispatchEvent(new Event('variablechange'));
	}
}.bind(Variable);
