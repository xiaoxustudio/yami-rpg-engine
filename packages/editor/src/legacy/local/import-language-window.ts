import { $ } from '@/util/dom.ts';
import { Window } from '@/tools/window-object.ts';
import { on, getFocus, read } from '@/util/element-utils.ts';
import { Editor } from '@/main/editor.ts';
import { Data } from '@/data/data-object.ts';
import { File } from '@/file/file-system-core.ts';
import { Local } from '@/tools/localization.ts';

import { Path } from '@/util/config.ts';

export const ImportLanguage: {
	filePath: string;
	initialize: () => void;
	open: () => void;
	importLanguagePack: (language: string, string: string) => void;
	parseLanguagePack: (string: string) => Record<string, string>;
	confirm: (event: any) => void;
} = {
	filePath: '',
	initialize: () => {},
	open: () => {},
	importLanguagePack: () => {},
	parseLanguagePack: () => ({}),
	confirm: () => {}
};

ImportLanguage.initialize = function (this: any) {
	if (!$('#importLanguage-confirm')) return;
	on($('#importLanguage-confirm'), 'click', this.confirm);
};

ImportLanguage.open = function (this: any) {
	const dialogs = (Editor.config as any).dialogs;
	File.showOpenDialog!({
		defaultPath: Path.resolve!(dialogs.import),
		filters: [
			{
				name: 'Language Pack',
				extensions: ['txt']
			}
		]
	}).then(({ filePaths }: any) => {
		if (filePaths.length === 1) {
			Window.open!('importLanguage');
			const items = [] as any[];
			for (const language of Data.config.localization.languages) {
				items.push({
					name: (Local.get as any)('languages.' + language.name),
					value: language.name
				});
			}
			const filePath = (this.filePath = filePaths[0]);
			const basename = Path.basename!(filePath);
			const extname = Path.extname!(basename);
			const language = Path.basename!(filePath, extname);
			$('#importLanguage-language').loadItems(items);
			$('#importLanguage-language').write2(language);
			getFocus($('#importLanguage-language'));
			dialogs.import = Path.slash!(Path.dirname!(filePath));
		}
	});
};

ImportLanguage.importLanguagePack = function (this: any, language: string, string: string) {
	const map = Data.localization.map;
	for (const [id, text] of Object.entries(this.parseLanguagePack!(string))) {
		const item = map[id];
		if (item?.contents[language] !== undefined) {
			item.contents[language] = text;
		}
	}
	File.planToSave!(Data.manifest.project.localization);
};

ImportLanguage.parseLanguagePack = function (this: any, string: string) {
	const regexp = /\$([0-9a-fA-F]{16})\n([\s\S]*?)\n?(?=\n?\$[0-9a-fA-F]{16}|$)/g;
	const map: Record<string, string> = {} as Record<string, any>;
	let match: RegExpExecArray | null;
	while ((match = regexp.exec(string))) {
		const id = match[1].toLowerCase();
		const text = match[2];
		map[id] = text;
	}
	return map;
};

ImportLanguage.confirm = function (this: any, event: any) {
	const get = (Local.createGetter as any)('confirmation');
	const filename = Path.basename!(ImportLanguage.filePath);
	const language = read($('#importLanguage-language'));
	const langname = (Local.get as any)('languages.' + language);
	Window.confirm!(
		{
			message: get('importLanguagePack')
				.replace('<filename>', filename)
				.replace('<langname>', langname)
		},
		[
			{
				label: get('confirm'),
				click: () => {
					Window.close!('importLanguage');
					File.get!({
						local: ImportLanguage.filePath,
						type: 'text'
					}).then((text: any) => {
						if (text) {
							ImportLanguage.importLanguagePack!(language, text);
						}
					});
				}
			},
			{
				label: get('cancel')
			}
		]
	);
};
