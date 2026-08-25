import { History } from '@app/tools/history.ts';
import { ParamListHistory } from '@ui-kit';

export interface InspectorParamData {
	type: string;
	array: unknown[];
	history: {
		owner: { setTarget(target: unknown): void; planToSave(): void };
		list: unknown;
	};
	target: unknown;
	[k: string]: unknown;
}

export interface ParamHistoryOwner {
	history: History;
	setTarget(target: unknown): void;
	planToSave(): void;
}

export class ParamHistory {
	editor: { target: unknown };
	owner: ParamHistoryOwner;
	list: unknown;

	constructor(
		editor: { target?: unknown } | null | undefined,
		owner:
			| {
					history?: unknown;
					setTarget?: (target: unknown) => void;
					planToSave?: () => void;
			  }
			| null
			| undefined,
		list: unknown
	) {
		this.editor = editor as { target: unknown };
		this.owner = owner as ParamHistoryOwner;
		this.list = list;
	}

	reset() {}

	save(data: { type: string } & InspectorParamData) {
		const { target } = this.editor;
		if (target !== null) {
			switch (data.type) {
				case 'insert':
					data.type = 'inspector-param-insert';
					break;
				case 'replace':
					data.type = 'inspector-param-replace';
					break;
				case 'delete':
					data.type = 'inspector-param-delete';
					break;
				case 'toggle':
					data.type = 'inspector-param-toggle';
					break;
			}
			data.history = this;
			data.target = target;
			this.owner.history.save(data);
		}
	}

	restore(operation: string) {
		this.owner.history.restore(operation);
	}

	canUndo() {
		const history = this.owner.history;
		const data = history[history.index];
		return data?.type.indexOf('inspector-param') === 0;
	}

	canRedo() {
		const history = this.owner.history;
		const data = history[history.index + 1];
		return data?.type.indexOf('inspector-param') === 0;
	}
}

export function registerParamHistoryProcessors() {
	// oxlint-disable-next-line no-explicit-any
	const processors = History.processors as Record<string, (operation: string, data: any) => void>;
	processors['inspector-param-insert'] = (operation: string, data: InspectorParamData) => {
		const { history, target } = data;
		const { owner, list } = history;
		ParamListHistory.restore(
			list as Parameters<typeof ParamListHistory.restore>[0],
			data,
			'insert',
			operation as 'undo' | 'redo'
		);
		owner.setTarget(target);
		owner.planToSave();
	};
	processors['inspector-param-replace'] = (operation: string, data: InspectorParamData) => {
		const { history, target } = data;
		const { owner, list } = history;
		ParamListHistory.restore(
			list as Parameters<typeof ParamListHistory.restore>[0],
			data,
			'replace',
			operation as 'undo' | 'redo'
		);
		owner.setTarget(target);
		owner.planToSave();
	};
	processors['inspector-param-delete'] = (operation: string, data: InspectorParamData) => {
		const { history, target } = data;
		const { owner, list } = history;
		ParamListHistory.restore(
			list as Parameters<typeof ParamListHistory.restore>[0],
			data,
			'delete',
			operation as 'undo' | 'redo'
		);
		owner.setTarget(target);
		owner.planToSave();
	};
	processors['inspector-param-toggle'] = (operation: string, data: InspectorParamData) => {
		const { history, target } = data;
		const { owner, list } = history;
		ParamListHistory.restore(
			list as Parameters<typeof ParamListHistory.restore>[0],
			data,
			'toggle',
			operation as 'undo' | 'redo'
		);
		owner.setTarget(target);
		owner.planToSave();
	};
}

export function useParamHistory() {
	return { ParamHistory, registerParamHistoryProcessors };
}
