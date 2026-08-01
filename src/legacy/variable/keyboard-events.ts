import { read } from '@/util/element-utils.ts';
import { Variable } from './variable.ts';
import { Shortcuts } from '@/tools/shortcut-registry.ts';

Variable.keydown = Shortcuts.createUndoRedo(Variable);

Variable.listKeydown = function (this: any, event: any) {
	const item = read(this);
	if (event.cmdOrCtrlKey) {
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

Variable.listPointerdown = function (this: any, event: any) {
	switch (event.button) {
		case 3:
			this.cancelSearch();
			break;
	}
};

Variable.panelKeydown = function (event: any) {
	switch (event.target.tagName) {
		case 'INPUT':
		case 'TEXTAREA':
			if (event.cmdOrCtrlKey) {
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

Variable.searcherInput = function (this: any, event: any) {
	if (event.inputType === 'insertCompositionText') {
		return;
	}
	const text = (this as any).input.value;
	Variable.list.searchNodesDebounced(text);
};
