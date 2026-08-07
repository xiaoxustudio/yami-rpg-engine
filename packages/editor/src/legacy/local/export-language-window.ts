import { $ } from '@/util/dom.ts';
import { Window } from '@/tools/window-object.ts';
import { on, read } from '@/util/element-utils.ts';
import { Path } from '@/util/config.ts';
import { File } from '@/file/file-system-core.ts';
import { Editor } from '@/main/editor.ts';
import { Data } from '@/data/data-object.ts';
import { FSP } from '@/file/file-system.ts';
import { Local } from '@/tools/localization.ts';

export const ExportLanguage: {
	initialize: () => void;
	open: () => void;
	exportLanguagePack: (first: string, second: string) => string;
	stringifyLanguagePack: (map: Record<string, string>) => string;
	confirm: (event: any) => void;
} = {
	initialize: () => {},
	open: () => {},
	exportLanguagePack: () => '',
	stringifyLanguagePack: () => '',
	confirm: () => {}
};

ExportLanguage.initialize = function (this: any) {
	if (!$('#exportLanguage-confirm')) return;
	on($('#exportLanguage-confirm'), 'click', this.confirm);
};

ExportLanguage.open = function (this: any) {
	Window.open!('exportLanguage');

	const items = [] as any[];
	const none = { name: (Local.get as any)('common.none'), value: '' };
	for (const language of Data.config.localization.languages) {
		items.push({
			name: (Local.get as any)('languages.' + language.name),
			value: language.name
		});
	}
	$('#exportLanguage-first').loadItems(items);
	$('#exportLanguage-first').writeDefault();
	$('#exportLanguage-second').loadItems([none, ...items]);
	$('#exportLanguage-second').writeDefault();
};

ExportLanguage.exportLanguagePack = function (this: any, first: string, second: string) {
	const pack: Record<string, string> = {} as Record<string, any>;
	const loadText = (items: any[]) => {
		for (const item of items) {
			if (item.class === 'folder') {
				loadText(item.children);
			} else {
				const { id, contents } = item;
				pack[id] = contents[first] || contents[second] || '';
			}
		}
	};
	loadText(Data.localization.list);
	return this.stringifyLanguagePack!(pack);
};

ExportLanguage.stringifyLanguagePack = function (this: any, map: Record<string, string>) {
	const entries = Object.entries(map);
	const length = entries.length;
	const strings = new Array(length);
	for (let i = 0; i < length; i++) {
		const [id, text] = entries[i];
		strings[i] = '$' + id + '\n' + text;
	}
	return strings.join('\n\n');
};

ExportLanguage.confirm = function (this: any, event: any) {
	Window.close!('exportLanguage');
	const dialogs = (Editor.config as any).dialogs;
	const first = read($('#exportLanguage-first'));
	const second = read($('#exportLanguage-second'));
	File.showSaveDialog!({
		defaultPath: Path.resolve!(dialogs.export, first + '.txt')
	}).then(({ filePath }: any) => {
		if (filePath) {
			dialogs.export = Path.slash!(Path.dirname!(filePath));
			const string = ExportLanguage.exportLanguagePack!(first, second);
			return FSP.writeFile!(filePath, string);
		}
	});
};
