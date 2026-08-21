import {
	createCommandListApi,
	createCommandListElement,
	commandListPrototype,
	commandListStatics,
	type CommandListApiOptions
} from '@ui-kit';
import type { MenuItem, MenuOptions } from '@ui-kit';
import { SettingConfig } from '@app/services/project/settingconfig';
import { getVariable } from '@app/utils/safe';
import { CommandHistory } from '@ui-kit';
import { ctrl } from '@app/utils/event-accessors';
import { Command } from '@app/commands/command-object.ts';
import { Data } from '@app/data/data-object.ts';
import { Attribute } from '@app/attribute/attribute-window.ts';
import { CommandSuggestion } from '@app/commands/command-tip.ts';
import { EventEditor } from '@app/commands/event-editor.ts';
import { Menu } from '@app/components/menu-list.ts';
import { Enum } from '@app/enum/enum-window.ts';
import { GameLocal } from '@app/local/local-object.ts';
import { SearchString } from '@app/stores/searchString';
import { getLocalStore } from '@app/stores/local';
import { t, createGetter } from '@app/i18n';
import { setTooltip } from '@app/utils/element-utils.ts';
import { GlobalClipboard } from '@app/utils/clipboard';

const Clipboard = GlobalClipboard;

const options = {
	command: {
		parse: (item: Record<string, unknown>, varMap: Record<string, unknown>) =>
			Command.parse(item, varMap),
		fetchVariables: (data: Record<string, unknown>) => Command.fetchVariables(data),
		insert: (list: HTMLElement, id?: string) => Command.insert(list, id),
		edit: (list: HTMLElement, command?: Record<string, unknown>) => Command.edit(list, command),
		parseUnlinkedId: (id: string) => Command.parseUnlinkedId(id),
		colorizeCodeLines: (items: HTMLElement[], code: string) =>
			Command.cases.script.colorizeCodeLines(items, code)
	},
	dataLookup: {
		attribute: (id: string) => Attribute.getAttribute(id),
		enumString: (id: string) => Enum.getString(id),
		gameLocalReplace: (text: string) => GameLocal.replace(text),
		guidMap: () => Data.manifest?.guidMap ?? {},
		scenePresets: () => Data.scenePresets ?? {},
		uiPresets: () => Data.uiPresets ?? {}
	},
	commandHistory: CommandHistory,
	clipboard: {
		write: (type: string, data: unknown) => Clipboard?.write?.(type, data),
		read: (type: string) => Clipboard?.read?.(type),
		has: (type: string) => Clipboard?.has?.(type)
	},
	settingConfig: SettingConfig,
	localize: {
		language: () => getLocalStore().language,
		get: (key: string) => t(key),
		createGetter: (key: string) => createGetter(key)
	},
	commandSuggestion: {
		searcher: () => CommandSuggestion.searcher
	},
	eventEditor: {
		openGlobalEvent: (id: string) => EventEditor.openGlobalEvent!(id)
	},
	searchString: {
		open: (list: Parameters<typeof SearchString.open>[0]) => SearchString.open(list)
	},
	menuPopup: (popupOptions: MenuOptions, items: MenuItem[]) => Menu.popup(popupOptions, items),
	getVariable,
	ctrl: (key: string) => ctrl(key),
	setTooltip: (el: HTMLElement, tip: string) => setTooltip(el, tip)
};

interface CommandListStaticsType {
	alphabetCode: RegExp;
	highlightedTexts: HTMLElement[];
	highlightTexts: (data: { varSpace: string; varType: string; varKey: string }) => void;
	unhighlightTexts: () => void;
	textPointerenter: (event: PointerEvent) => void;
	textPointerleave: (event: PointerEvent) => void;
	prototype: Record<string, (...args: any[]) => any>;
}

export const CommandList: CommandListStaticsType = {
	alphabetCode: commandListStatics.alphabetCode,
	highlightedTexts: commandListStatics.highlightedTexts,
	highlightTexts: commandListStatics.highlightTexts,
	unhighlightTexts: commandListStatics.unhighlightTexts,
	textPointerenter: commandListStatics.textPointerenter,
	textPointerleave: commandListStatics.textPointerleave,
	prototype: commandListPrototype
};

export const commandListOptions = options;

export function attachCommandListApi(el: HTMLElement): void {
	createCommandListApi(el, options as unknown as CommandListApiOptions);
}

export function createCommandList(): HTMLElement {
	return createCommandListElement(options as unknown as CommandListApiOptions);
}
