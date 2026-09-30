import { clamp } from '../../../utils/dom';
import { ROW_HEIGHT } from '../../../utils/common-list';

export type NavDirection = 'up' | 'down';

export type SelectionRange = {
	start: number;
	end: number;
};

export type FolderExpansionState = {
	markVisible: boolean;
	expanded: boolean;
};

type NavFolderRef = {
	stats: { ino: unknown };
	path: string;
};

export interface FileNavCore {
	clamp: (value: number, min: number, max: number) => number;
	computeRelativeSelectionIndex: (
		direction: NavDirection,
		count: number,
		indices: number[]
	) => number;
	computeScrollTop: (
		mode: string,
		index: number,
		scrollTop: number,
		innerHeight: number
	) => number | null;
	computeFolderExpansionState: (
		file: { subfolders: unknown[] },
		contextExpanded: boolean
	) => FolderExpansionState;
	computeTextIndent: (indent: number) => number;
	clearFolderElements: (list: unknown[], start: number) => void;
	resolveSelections: (
		display: string | undefined,
		normal: unknown[],
		search: unknown[]
	) => unknown[];
	computeShiftSelectionRange: (anchor: number, indices: number[]) => SelectionRange;
	resolveFolderPaths: (selections: unknown[], inoMap: Record<string, unknown>) => string[];
	isForbiddenFileNameChar: (text: string) => boolean;
	collectAncestorFolders: <T extends { parent?: T }>(folders: T[]) => T[];
}

export function createFileNavCore(): FileNavCore {
	const computeRelativeSelectionIndex = (
		direction: NavDirection,
		count: number,
		indices: number[]
	): number => {
		let start = Infinity;
		let end = -Infinity;
		for (const index of indices) {
			if (index !== -1) {
				start = Math.min(start, index);
				end = Math.max(end, index);
			}
		}
		const last = count - 1;
		switch (direction) {
			case 'up':
				return clamp(start - 1, 0, last);
			case 'down':
				return clamp(end + 1, 0, last);
		}
	};

	const computeScrollTop = (
		mode: string,
		index: number,
		scrollTop: number,
		innerHeight: number
	): number | null => {
		switch (mode) {
			case 'active':
				return clamp(
					scrollTop,
					index * ROW_HEIGHT + ROW_HEIGHT - innerHeight,
					index * ROW_HEIGHT
				);
			case 'middle':
				return (
					Math.round((index * ROW_HEIGHT + 10 - innerHeight / 2) / ROW_HEIGHT) *
					ROW_HEIGHT
				);
			default:
				return null;
		}
	};

	const computeFolderExpansionState = (
		file: { subfolders: unknown[] },
		contextExpanded: boolean
	): FolderExpansionState => {
		const markVisible = file.subfolders.length !== 0;
		return { markVisible, expanded: markVisible && contextExpanded };
	};

	const computeTextIndent = (indent: number): number => indent * 12;

	const clearFolderElements = (list: unknown[], start: number): void => {
		if (list.length > 256 && list.length !== start) {
			list.length = start;
		}
		let i = start;
		while (list[i] !== undefined) {
			list[i++] = undefined;
		}
	};

	const resolveSelections = (
		display: string | undefined,
		normal: unknown[],
		search: unknown[]
	): unknown[] => {
		switch (display) {
			case 'normal':
				return normal;
			case 'search':
				return search;
		}
		return [];
	};

	const computeShiftSelectionRange = (anchor: number, indices: number[]): SelectionRange => {
		let start = anchor;
		let end = anchor;
		for (const index of indices) {
			if (index !== -1) {
				start = Math.min(start, index);
				end = Math.max(end, index);
			}
		}
		return { start, end };
	};

	const resolveFolderPaths = (
		selections: unknown[],
		inoMap: Record<string, unknown>
	): string[] => {
		const paths: string[] = [];
		for (const folder of selections) {
			const { ino } = (folder as NavFolderRef).stats;
			const { path } = (inoMap[ino as string] || folder) as NavFolderRef;
			paths.push(path);
		}
		return paths;
	};

	const isForbiddenFileNameChar = (text: string): boolean => /[\\/:*?"<>|]/.test(text);

	const collectAncestorFolders = <T extends { parent?: T }>(folders: T[]): T[] => {
		const ancestors: T[] = [];
		for (const folder of folders) {
			let current = folder.parent;
			while (current) {
				ancestors.push(current);
				current = current.parent;
			}
		}
		return ancestors;
	};

	return {
		clamp,
		computeRelativeSelectionIndex,
		computeScrollTop,
		computeFolderExpansionState,
		computeTextIndent,
		clearFolderElements,
		resolveSelections,
		computeShiftSelectionRange,
		resolveFolderPaths,
		isForbiddenFileNameChar,
		collectAncestorFolders
	};
}
