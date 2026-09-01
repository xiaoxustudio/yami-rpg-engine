export type CommandData = {
	id: string;
	params: { type?: string; eventId?: string } & Record<string, unknown>;
	commands?: CommandData[];
	folded?: boolean;
	[k: string]: unknown;
};

export type CommandRow = {
	dataItem: CommandData | null;
	dataIndent: number;
	dataKey: boolean;
};

export type CommandRowList = CommandRow[] & { count: number };

export type ScriptPreview = {
	code: string;
	lines: number;
	visibleLines: number;
};

export interface CommandCore {
	compress: (str: string) => string;
	computeTextIndent: (indent: number, language: string | undefined) => string;
	truncateScript: (script: string, maxLines: number) => ScriptPreview;
	parseSearchRegExp: (str: string) => RegExp | null;
	computeSelectRange: (items: CommandRowList, start: number, end: number) => [number, number];
	getSelectUpIndex: (items: CommandRow[], start: number, end: number) => number;
	getSelectDownIndex: (items: CommandRowList, start: number, end: number) => number;
	getRangeByIndex: (items: CommandRowList, index: number) => number[];
	getRangeByData: (items: CommandRowList, data: CommandData) => number[];
	tryGetEventId: (data: CommandData | null | undefined) => string | undefined;
	enableItems: (commands: CommandData[]) => void;
	disableItems: (commands: CommandData[]) => void;
	generateExecutableCode: (commands: CommandData[]) => string;
}

export function createCommandCore(): CommandCore {
	const compress = (str: string): string => str.replace(/\s+/g, ' ').trim();

	const computeTextIndent = (indent: number, language: string | undefined): string => {
		switch (language) {
			case 'en-US':
				return indent * 4 + 'ch';
			default:
				return indent * 2 + 'em';
		}
	};

	const truncateScript = (script: string, maxLines: number): ScriptPreview => {
		let code = script;
		const matches = code.match(/\n/g);
		const lines = (matches?.length ?? 0) + 1;
		if (lines > maxLines) {
			let count = 0;
			const chars = code;
			const clen = chars.length;
			for (let i = 0; i < clen; i++) {
				if (chars[i] === '\n' && ++count === maxLines) {
					code = chars.slice(0, i);
					break;
				}
			}
		}
		const visibleLines = Math.min(lines, maxLines + 1);
		return { code, lines, visibleLines };
	};

	const parseSearchRegExp = (str: string): RegExp | null => {
		const strOri = str.trim();
		try {
			return new RegExp(
				strOri.substring(strOri.indexOf('/') + 1, strOri.lastIndexOf('/')),
				strOri.substring(strOri.lastIndexOf('/') + 1)
			);
		} catch {
			return null;
		}
	};

	const computeSelectRange = (
		items: CommandRowList,
		start: number,
		end: number
	): [number, number] => {
		if (start > end) {
			[start, end] = [end, start];
		}
		const count = items.count;
		start = Math.min(Math.max(start, 0), count - 1);
		end = Math.min(Math.max(end, 0), count - 1);
		let indent = Infinity;
		for (let i = start; i <= end; i++) {
			const { dataIndent } = items[i];
			if (dataIndent < indent) {
				indent = dataIndent;
			}
		}
		for (let i = start; i >= 0; i--) {
			const item = items[i];
			if (item.dataIndent === indent && item.dataKey === true) {
				start = i;
				break;
			}
		}
		for (let i = end + 1; i < count; i++) {
			const item = items[i];
			if (item.dataIndent < indent || (item.dataIndent === indent && item.dataKey === true)) {
				end = i - 1;
				break;
			}
		}
		if (start !== end) {
			const item = items[end];
			if (!item.dataItem) {
				end--;
			}
		}
		return [start, end];
	};

	const getSelectUpIndex = (items: CommandRow[], start: number, end: number): number => {
		const sData = items[start].dataItem;
		const eData = items[end].dataItem;
		let i = start;
		if (sData === eData) {
			while (--i >= 0) {
				if (items[i].dataKey) {
					break;
				}
			}
		}
		return i;
	};

	const getSelectDownIndex = (items: CommandRowList, start: number, end: number): number => {
		const sData = items[start].dataItem;
		const eData = items[end].dataItem;
		let i = end;
		if (sData === eData) {
			const eItem = items[i];
			if (!eItem.dataKey) {
				const data = eItem.dataItem;
				while (--i >= 0) {
					const item = items[i];
					if (item.dataItem === data && item.dataKey === true) {
						break;
					}
				}
			}
			const { count } = items;
			while (++i < count) {
				if (items[i].dataKey) {
					break;
				}
			}
		}
		return i;
	};

	const getRangeByIndex = (items: CommandRowList, index: number): number[] => {
		const count = items.count;
		const item = items[index];
		const data = item.dataItem;
		const indent = item.dataIndent;
		let start = index;
		let end = index;
		for (let i = index; i >= 0; i--) {
			const item = items[i];
			if (item.dataItem === data && item.dataKey === true) {
				start = i;
				break;
			}
		}
		for (let i = index + 1; i < count; i++) {
			const item = items[i];
			if (item.dataIndent < indent || (item.dataIndent === indent && item.dataKey === true)) {
				end = i - 1;
				break;
			}
		}
		return [start, end];
	};

	const getRangeByData = (items: CommandRowList, data: CommandData): number[] => {
		const count = items.count;
		let indent: number | undefined;
		let start = 0;
		let end = 0;
		for (let i = 0; i < count; i++) {
			const item = items[i];
			if (item.dataItem === data) {
				indent = item.dataIndent;
				start = i;
				break;
			}
		}
		for (let i = start + 1; i < count; i++) {
			const item = items[i];
			if (
				item.dataIndent < indent! ||
				(item.dataIndent === indent! && item.dataKey === true)
			) {
				end = i - 1;
				break;
			}
		}
		return [start, end];
	};

	const tryGetEventId = (data: CommandData | null | undefined): string | undefined => {
		const id = data?.id;
		if (id === 'callEvent' || id === '!callEvent') {
			if (data!.params.type === 'global') {
				return data!.params.eventId;
			}
		}
		return undefined;
	};

	const enableItems = (commands: CommandData[]): void => {
		for (const command of commands) {
			if (command.id[0] === '!') {
				command.id = command.id.slice(1);
			}
		}
	};

	const disableItems = (commands: CommandData[]): void => {
		for (const command of commands) {
			if (command.id[0] !== '!') {
				command.id = '!' + command.id;
			}
		}
	};

	const generateExecutableCode = (commands: CommandData[]): string => {
		const commandsJson = JSON.stringify(commands, null, 2);

		const code = `const commands = ${commandsJson};
try {
	if (typeof Command === 'undefined' || typeof EventHandler === 'undefined') {
		throw new Error('运行环境不完整');
	}
	const event = new EventHandler(Command.compile(commands));
	EventHandler.call(event);
} catch (err) {
	console.error('✗ 执行出错:', err.message);
}`;
		return code;
	};

	return {
		compress,
		computeTextIndent,
		truncateScript,
		parseSearchRegExp,
		computeSelectRange,
		getSelectUpIndex,
		getSelectDownIndex,
		getRangeByIndex,
		getRangeByData,
		tryGetEventId,
		enableItems,
		disableItems,
		generateExecutableCode
	};
}
