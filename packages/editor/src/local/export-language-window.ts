import { $ } from '@app/utils/dom';
import { Window } from '@app/tools/window-object.ts';
import { on } from '@app/utils/element-utils.ts';
import { Path } from '@app/utils/config';
import { File } from '@app/file/file-system-core.ts';
import { Editor } from '@app/services/project/editor.ts';
import { Data } from '@app/data/data-object.ts';
import { FSP } from '@app/services/file-system/fs-bridge.ts';
import { t } from '@app/i18n';

type LocalizationListItem = {
	class?: string;
	children?: LocalizationListItem[];
	id?: string;
	contents?: Record<string, string>;
};

export interface ExportLanguageForm {
	first: string;
	second: string;
}

export const ExportLanguage: {
	initialize: () => void;
	open: () => void;
	exportLanguagePack: (first: string, second: string) => string;
	stringifyLanguagePack: (map: Record<string, string>) => string;
	confirm: (event: Event) => void;
} = {
	initialize: () => {},
	open: () => {},
	exportLanguagePack: () => '',
	stringifyLanguagePack: () => '',
	confirm: () => {}
};

ExportLanguage.initialize = function (this: typeof ExportLanguage) {
	if (!$('#exportLanguage-confirm')) return;
	on($('#exportLanguage-confirm'), 'click', this.confirm);
};

ExportLanguage.open = function (this: typeof ExportLanguage) {
	Window.open!('exportLanguage');

	const items: { name: string; value: string }[] = [];
	const none = { name: t('common.none'), value: '' };
	for (const language of Data.config.localization.languages) {
		items.push({
			name: t('languages.' + language.name),
			value: language.name
		});
	}
	$('#exportLanguage-first').loadItems(items);
	$('#exportLanguage-second').loadItems([none, ...items]);
	const setForm = (
		$('#exportLanguage') as
			| (HTMLElement & { setForm?: (data: Partial<ExportLanguageForm>) => void })
			| null
	)?.setForm;
	setForm?.({ first: items[0]?.value ?? '', second: '' });
};

ExportLanguage.exportLanguagePack = function (
	this: typeof ExportLanguage,
	first: string,
	second: string
) {
	const pack: Record<string, string> = {};
	const loadText = (items: LocalizationListItem[]) => {
		for (const item of items) {
			if (item.class === 'folder') {
				loadText(item.children!);
			} else {
				const { id, contents } = item;
				pack[id!] = contents![first] || contents![second] || '';
			}
		}
	};
	loadText(Data.localization.list);
	return this.stringifyLanguagePack!(pack);
};

ExportLanguage.stringifyLanguagePack = function (
	this: typeof ExportLanguage,
	map: Record<string, string>
) {
	const entries = Object.entries(map);
	const length = entries.length;
	const strings = new Array(length);
	for (let i = 0; i < length; i++) {
		const [id, text] = entries[i];
		strings[i] = '$' + id + '\n' + text;
	}
	return strings.join('\n\n');
};

ExportLanguage.confirm = function (this: typeof ExportLanguage, event: Event) {
	Window.close!('exportLanguage');
	const dialogs = Editor.config!.dialogs as { import: string; export: string };
	const getForm = (
		$('#exportLanguage') as (HTMLElement & { getForm?: () => ExportLanguageForm }) | null
	)?.getForm;
	const { first, second } = getForm?.() ?? ({} as ExportLanguageForm);
	File.showSaveDialog!({
		defaultPath: Path.resolve!(dialogs.export, first + '.txt')
	}).then(({ filePath }: { filePath: string }) => {
		if (filePath) {
			dialogs.export = Path.slash!(Path.dirname!(filePath));
			const string = ExportLanguage.exportLanguagePack!(first, second);
			return FSP.writeFile!(filePath, string);
		}
	});
};
