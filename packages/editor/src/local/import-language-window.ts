import { $ } from '@app/utils/dom';
import { Window } from '@app/tools/window-object.ts';
import { on, getFocus, read } from '@app/utils/element-utils.ts';
import { Editor } from '@app/services/project/editor.ts';
import { Data } from '@app/data/data-object.ts';
import { File } from '@app/file/file-system-core.ts';
import { t, createGetter } from '@app/i18n';

import { Path } from '@app/utils/config';

export const ImportLanguage: {
	filePath: string;
	initialize: () => void;
	open: () => void;
	importLanguagePack: (language: string, string: string) => void;
	parseLanguagePack: (string: string) => Record<string, string>;
	confirm: (event: Event) => void;
} = {
	filePath: '',
	initialize: () => {},
	open: () => {},
	importLanguagePack: () => {},
	parseLanguagePack: () => ({}),
	confirm: () => {}
};

ImportLanguage.initialize = function (this: typeof ImportLanguage) {
	if (!$('#importLanguage-confirm')) return;
	on($('#importLanguage-confirm'), 'click', this.confirm);
};

ImportLanguage.open = function (this: typeof ImportLanguage) {
	const dialogs = Editor.config!.dialogs as { import: string; export: string };
	File.showOpenDialog!({
		defaultPath: Path.resolve!(dialogs.import),
		filters: [
			{
				name: 'Language Pack',
				extensions: ['txt']
			}
		]
	}).then(({ filePaths }: { filePaths: string[] }) => {
		if (filePaths.length === 1) {
			Window.open!('importLanguage');
			const items: { name: string; value: string }[] = [];
			for (const language of Data.config.localization.languages) {
				items.push({
					name: t('languages.' + language.name),
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

ImportLanguage.importLanguagePack = function (
	this: typeof ImportLanguage,
	language: string,
	string: string
) {
	const map = Data.localization.map;
	for (const [id, text] of Object.entries(this.parseLanguagePack!(string))) {
		const item = map[id];
		if (item?.contents[language] !== undefined) {
			item.contents[language] = text;
		}
	}
	File.planToSave!(Data.manifest.project.localization);
};

ImportLanguage.parseLanguagePack = function (this: typeof ImportLanguage, string: string) {
	const regexp = /\$([0-9a-fA-F]{16})\n([\s\S]*?)\n?(?=\n?\$[0-9a-fA-F]{16}|$)/g;
	const map: Record<string, string> = {};
	let match: RegExpExecArray | null;
	while ((match = regexp.exec(string))) {
		const id = match[1].toLowerCase();
		const text = match[2];
		map[id] = text;
	}
	return map;
};

ImportLanguage.confirm = function (this: typeof ImportLanguage, event: Event) {
	const get = createGetter('confirmation');
	const filename = Path.basename!(ImportLanguage.filePath);
	const language = read($('#importLanguage-language'));
	const langname = t('languages.' + language);
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
					}).then((text: string) => {
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
