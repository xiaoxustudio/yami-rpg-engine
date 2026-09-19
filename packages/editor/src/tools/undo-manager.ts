type ActiveEditorShape = {
	state?: string;
	undo?: ((...args: unknown[]) => unknown) | null;
	redo?: ((...args: unknown[]) => unknown) | null;
	history?: { canUndo(): boolean; canRedo(): boolean } | null;
};

export const UndoManager = {
	// 类型本来就是 `ActiveEditorShape | null`（下面 `setActive` 会写入它），
	// 直接断言成这个联合即可 —— 不必绕 `as unknown as`（2026-09-18）。
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
