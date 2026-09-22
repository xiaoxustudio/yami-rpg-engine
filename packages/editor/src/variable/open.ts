import { $ } from '@app/utils/dom';
import { Window } from '@app/tools/window-object.ts';
import { getFocus, read } from '@app/utils/element-utils.ts';
import { Data } from '@app/data/data-object.ts';
import { File } from '@app/file/file-system-core.ts';
import { Reference } from '@app/log/related-references.ts';
import { getVariableStore } from '@app/stores/variable';

import { Variable } from '@app/variable/variable.ts';
import { emitCustom } from '@app/events/custom-events';

Variable.open = function (this: typeof Variable, target: unknown = null) {
	getVariableStore().open(target as { [k: string]: unknown } | null);
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
	getVariableStore().undo();
};

Variable.redo = function (this: typeof Variable) {
	getVariableStore().redo();
};

Variable.confirm = function (this: typeof Variable, _event?: Event) {
	const target = this.target;
	if (target instanceof Object) {
		const variable = getVariableStore().state.selected;
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
		this.apply!();
		(target as { input?: (value: unknown) => void }).input?.(variable.id);
	} else {
		this.apply!();
	}
	Window.close!('variable');
}.bind(Variable);

Variable.apply = function (this: typeof Variable, _event?: Event) {
	if (this.changed) {
		this.changed = false;

		this.packVariables!();
		File.planToSave!(Data.manifest.project.variables);

		emitCustom('variablechange');
	}
}.bind(Variable);
