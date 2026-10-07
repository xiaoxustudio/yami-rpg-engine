import { IUndoRedoHistory } from './history.ts';

export interface IListInterface {
	target: HTMLElement | null;
	type: string;
	editor: { target?: unknown } | null;
	owner: { history?: unknown } | null;
	history: IUndoRedoHistory | null;

	initialize(list: HTMLElement): void;
}

export interface IFilteredListInterface extends IListInterface {
	filter: string;
}

export interface IScriptListInterface extends IFilteredListInterface {
	script: { id: string; enabled?: boolean; parameters?: Record<string, unknown> } | null;
}
