type ActiveEditorShape = {
	state?: string;
	undo?: ((...args: unknown[]) => unknown) | null;
	redo?: ((...args: unknown[]) => unknown) | null;
	history?: { canUndo(): boolean; canRedo(): boolean } | null;
};

export const UndoManager = {
	active: null as ActiveEditorShape | null,

	onActiveChange: null as (() => void) | null,

	setActive(editor: ActiveEditorShape | null) {
		this.active = editor;
		this.onActiveChange?.();
	},

	getActive() {
		return this.active;
	},

	undo() {
		this.active?.undo?.();
	},

	redo() {
		this.active?.redo?.();
	},

	canUndo() {
		return this.active?.history?.canUndo() ?? false;
	},

	canRedo() {
		return this.active?.history?.canRedo() ?? false;
	}
};
