import ExcelJS from 'exceljs';
import { dialog } from 'electron';
import type { ToExcelBody } from '../../src/services/ipc/channels.ts';
import { getWindowFromEvent } from '../window-manager.ts';
import type { IpcMainInvokeEvent } from '../types/main.ts';

const generate32bit = (): string => {
	const n = Math.random() * 0x100000000;
	const s = Math.floor(n).toString(16);
	return s.length === 8 ? s : s.padStart(8, '0');
};
function generate64bit(): string {
	let id;
	// GUID 用作哈希表键，避免纯数字键降低访问速度
	do {
		id = generate32bit() + generate32bit();
	} while (!/[a-f]/.test(id));
	return id;
}

export const toExcel = async (event: IpcMainInvokeEvent, { langs, list }: ToExcelBody) => {
	const workbook = new ExcelJS.Workbook();
	const worksheet = workbook.addWorksheet('open-yami');
	worksheet.columns = [
		{ header: 'ID', key: 'id', width: 20 },
		{ header: 'Name', key: 'name', width: 10 },
		...langs.map((v: string) => ({ header: v, key: v, width: 10 })),
		{ header: 'parentID', key: 'parentID', width: 20 },
		{ header: 'isDir', key: 'isDir', width: 10 }
	];
	type TranslationItem = {
		class?: unknown;
		children?: TranslationItem[];
		name?: unknown;
		id?: unknown;
		contents?: Record<string, unknown>;
	};
	const transformList = (DataList: TranslationItem[], parentID?: string, _isDir?: boolean) => {
		for (let item of DataList) {
			if (item?.class) {
				const id = generate64bit();
				transformList(item.children!, id, true);
				worksheet.addRow({
					id: id,
					name: item.name || '',
					parentID,
					isDir: 1
				});
			} else {
				const data: Record<string, unknown> = {
					id: item.id,
					name: item.name || '',
					parentID
				};
				langs.forEach((v: string) => {
					data[v] = item.contents![v];
				});
				worksheet.addRow(data);
			}
		}
	};
	transformList(list as TranslationItem[]);
	const window = getWindowFromEvent(event);
	void dialog
		.showSaveDialog(window, {
			title: '保存到Excel',
			filters: [{ name: 'Excel(翻译文件)', extensions: ['xlsx'] }]
		})
		.then((result) => {
			if (result.canceled) return;
			const filePath = result.filePath;
			return workbook.xlsx.writeFile(filePath!);
		});
};

export const fromExcel = async (event: IpcMainInvokeEvent) => {
	try {
		const window = getWindowFromEvent(event);
		const { filePaths, canceled } = await dialog.showOpenDialog(window, {
			title: '选择导入翻译文件',
			filters: [{ name: 'Excel(翻译文件)', extensions: ['xlsx'] }],
			properties: ['openFile']
		});

		if (canceled || !filePaths || filePaths.length === 0) return [];

		const filePath = filePaths[0];
		const workbook = new ExcelJS.Workbook();
		await workbook.xlsx.readFile(filePath);

		const worksheet = workbook.getWorksheet('open-yami');
		if (!worksheet) return [];

		// 解析表头：建立列标题到列号的映射
		const headerRow = worksheet.getRow(1);
		const colMap: Record<string, number> = {};
		headerRow.eachCell((cell, colNumber) => {
			// oxlint-disable-next-line no-base-to-string
			const value = String(cell.value || '').trim();
			if (value) colMap[value] = colNumber;
		});

		const dataMap = new Map();
		const rootNodes = [];
		type RowData = {
			class?: unknown;
			children?: RowData[];
			name?: unknown;
			id?: unknown;
			parentID?: unknown;
			contents?: Record<string, unknown>;
			expanded?: boolean;
		};

		for (let rowIndex = 2; rowIndex <= worksheet.rowCount; rowIndex++) {
			const row = worksheet.getRow(rowIndex);
			const isDirCell = row.getCell(colMap['isDir']);
			const isDir = isDirCell && isDirCell.value === 1;

			const rowData: RowData = isDir
				? {
						class: 'folder',
						id: row.getCell(colMap['ID']).value,
						name: row.getCell(colMap['Name']).value || '',
						parentID: row.getCell(colMap['parentID']).value,
						expanded: false,
						children: []
					}
				: {
						id: row.getCell(colMap['ID']).value,
						name: row.getCell(colMap['Name']).value,
						parentID: row.getCell(colMap['parentID']).value,
						contents: {}
					};

			if (!isDir) {
				// 收集多语言内容（排除系统列）
				Object.keys(colMap).forEach((key) => {
					if (!['ID', 'Name', 'parentID', 'isDir'].includes(key)) {
						const cellValue = row.getCell(colMap[key]).value;
						rowData.contents![key] = cellValue !== null ? cellValue : '';
					}
				});
			}

			let parent = dataMap.get(rowData.id);
			if (parent && parent.class === 'folder') {
				rowData.children = parent.children;
				dataMap.delete(rowData.id);
			}
			dataMap.set(rowData.id, rowData);

			// 挂载到父节点或作为根节点
			if (rowData.parentID) {
				const parent = dataMap.get(rowData.parentID);
				if (parent) {
					parent.children = parent.children || [];
					parent.children.push(rowData);
				} else {
					dataMap.set(rowData.parentID, {
						class: 'folder',
						id: rowData.parentID,
						name: '',
						expanded: false,
						children: [rowData]
					});
				}
			} else {
				rootNodes.push(rowData);
			}
		}
		return rootNodes;
	} catch {
		return [];
	}
};
