import { read } from '@app/utils/element-utils.ts';
import { Variable } from './variable.ts';
import { Shortcuts } from '@app/legacy/tools/shortcut-registry.ts';

Variable.keydown = Shortcuts.createUndoRedo(Variable);

Variable.listKeydown = function (
	this: HTMLElement & { createVariable: () => unknown },
	event: KeyboardEvent
) {
	const item = read(this);
	if (event.ctrlKey || event.metaKey) {
		switch (event.code) {
			case 'KeyC':
				this.copy(item);
				break;
			case 'KeyV':
				this.paste();
				break;
		}
	} else if (event.altKey) {
		return;
	} else {
		switch (event.code) {
			case 'Insert':
				this.addNodeTo(this.createVariable(), item);
				break;
			case 'Delete':
				this.delete(item);
				break;
			case 'Backspace':
				this.cancelSearch();
				break;
		}
	}
};

Variable.listPointerdown = function (this: HTMLElement, event: PointerEvent) {
	switch (event.button) {
		case 3:
			this.cancelSearch();
			break;
	}
};

Variable.panelKeydown = function (event: KeyboardEvent) {
	switch ((event.target as HTMLElement).tagName) {
		case 'INPUT':
		case 'TEXTAREA':
			if (event.ctrlKey || event.metaKey) {
				switch (event.code) {
					case 'Enter':
					case 'NumpadEnter':
						break;
					default:
						event.stopPropagation();
						break;
				}
			}
			break;
	}
};

Variable.searcherInput = function (this: HTMLElement, event: InputEvent) {
	if (event.inputType === 'insertCompositionText') {
		return;
	}
	const text = this.input!.value;
	Variable.list.searchNodesDebounced(text);
};
