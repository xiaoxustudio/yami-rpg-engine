import { read } from '@app/utils/element-utils.ts';
import { Variable } from '@app/variable/variable.ts';
import { Shortcuts } from '@app/tools/shortcut-registry.ts';
import type { YamiElement } from '@app/types/element-api';

Variable.keydown = Shortcuts.createUndoRedo(Variable);

Variable.listKeydown = function (
	this: YamiElement & { createVariable: () => unknown },
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

Variable.listPointerdown = function (this: YamiElement, event: PointerEvent) {
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

Variable.searcherInput = function (this: YamiElement, event: InputEvent) {
	if (event.inputType === 'insertCompositionText') {
		return;
	}
	const text = (this.input as { value: string }).value;
	Variable.list.searchNodesDebounced(text);
};
