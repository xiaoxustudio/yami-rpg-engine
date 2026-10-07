export type HistoryOperation = 'undo' | 'redo';

export interface IEditableHistory extends IUndoRedoHistory {
	stack: HistoryData[];
	index: number;
}

export interface IUndoRedoHistory {
	reset(): void;

	save(data: HistoryData): void;
	restore(operation: HistoryOperation): void;

	canUndo(): boolean;

	canRedo(): boolean;
}

export interface ICapacityHistory extends IEditableHistory {
	capacity: number;
}

export interface IArrayHistory {
	index: number;

	capacity: number;

	reset(): void;

	save(data: HistoryData): void;
	restore(operation: HistoryOperation): void;

	canUndo(): boolean;

	canRedo(): boolean;
}

export interface IOwnedHistory extends IEditableHistory {
	owner: { history?: unknown } | null;
}

export interface HistoryData {
	type: string;
	[key: string]: unknown;
}

export type HistoryToggleMethod = 'enable' | 'disable';

export interface HistoryToggleData extends HistoryData {
	type: 'toggle';
	method: HistoryToggleMethod;
	items: unknown[];
}

export type HistoryListOperation = 'insert' | 'replace' | 'delete' | 'toggle';
