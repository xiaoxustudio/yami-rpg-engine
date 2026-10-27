import { Window } from '@app/tools/window-object.ts';
import { runWhenToolWindowReady } from '@app/tools/tool-window-host';
import { localEls } from '@app/local/element-registry';
import { registryElement } from '@app/utils/element-registry';
import { Path } from '@app/utils/config';
import { File } from '@app/file/file-system-core.ts';
import { Editor } from '@app/services/project/editor.ts';
import { Data } from '@app/data/data-object.ts';
import { FSP } from '@app/services/file-system/fs-bridge.ts';
import { getYamiI18n } from '@app/i18n';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});

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
	if (!localEls.get('exportLanguage')) return;
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
	// 导出语言窗口是懒挂载的：首次打开时控件/setForm 还没接上，等挂载后再填（已挂载则立即执行）
	runWhenToolWindowReady('exportLanguage', () => {
		localEls.get('exportLanguage-first')?.loadItems?.(items);
		localEls.get('exportLanguage-second')?.loadItems?.([none, ...items]);
		const setForm = registryElement<
			HTMLElement & { setForm?: (data: Partial<ExportLanguageForm>) => void }
		>(localEls, 'exportLanguage')?.setForm;
		setForm?.({ first: items[0]?.value ?? '', second: '' });
	});
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
	const strings = Array.from({ length: length });
	for (let i = 0; i < length; i++) {
		const [id, text] = entries[i];
		strings[i] = '$' + id + '\n' + text;
	}
	return strings.join('\n\n');
};

ExportLanguage.confirm = function (this: typeof ExportLanguage, _event: Event) {
	Window.close!('exportLanguage');
	const dialogs = Editor.config!.dialogs as { import: string; export: string };
	const getForm = registryElement<HTMLElement & { getForm?: () => ExportLanguageForm }>(
		localEls,
		'exportLanguage'
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
