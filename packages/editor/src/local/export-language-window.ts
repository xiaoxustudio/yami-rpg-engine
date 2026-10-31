import { Window } from '@app/tools/window-object.ts';
import { getExportLanguageBridge } from '@app/composables/export-language-bridge';
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
	// 窗口是否挂载由桥自己回答（组件 onMounted 时 provide），不再摸元素注册表
	if (!getExportLanguageBridge()) return;
};

ExportLanguage.open = function (this: typeof ExportLanguage) {
	const items: { name: string; value: string }[] = [];
	const none = { name: t('common.none'), value: '' };
	for (const language of Data.config.localization.languages) {
		items.push({
			name: t('languages.' + language.name),
			value: language.name
		});
	}
	// 导出语言窗口是懒挂载的：桥可用后再填（首次打开也不丢）。
	// 候选项由窗口组件灌进自己的模板 ref，单例不再知道控件 id。
	Window.openWith!('exportLanguage', () => {
		const bridge = getExportLanguageBridge();
		bridge?.loadItems(items, [none, ...items]);
		bridge?.setForm({ first: items[0]?.value ?? '', second: '' });
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
	const { first, second } = getExportLanguageBridge()?.getForm() ?? ({} as ExportLanguageForm);
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
