import {
	createCommandListApi,
	createCommandListElement,
	commandListPrototype,
	commandListStatics,
	type CommandListApiOptions
} from '@ui-kit';
import { SettingConfig } from '@/module/settingconfig';
import { getVariable } from '@/util/safe.ts';
import { CommandHistory } from './command-history.ts';
import { ctrl } from '@/util/event-accessors.ts';
import { Command } from '@/command/command-object.ts';
import { Data } from '@/data/data-object.ts';
import { Attribute } from '@/attribute/attribute-window.ts';
import { CommandSuggestion } from '@/command/command-tip.ts';
import { EventEditor } from '@/command/event-editor.ts';
import { Menu } from './menu-list.ts';
import { Enum } from '@/enum/enum-window.ts';
import { GameLocal } from '@/local/local-object.ts';
import { SearchString } from '@/module/searchstring.ts';
import { Local } from '@/tools/localization.ts';
import { setTooltip } from '@/util/element-utils.ts';
import { getGlobalClipboard } from '@/types/global-clipboard.ts';

const Clipboard = getGlobalClipboard();

const options = {
	command: {
		parse: (item: any, varMap: any) => Command.parse(item, varMap),
		fetchVariables: (data: any) => Command.fetchVariables(data),
		insert: (list: any, id?: string) => Command.insert(list, id),
		edit: (list: any, command?: any) => Command.edit(list, command),
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
		write: (type: string, data: any) => Clipboard?.write?.(type, data),
		read: (type: string) => Clipboard?.read?.(type),
		has: (type: string) => Clipboard?.has?.(type)
	},
	settingConfig: SettingConfig,
	localize: {
		language: () => Local.language,
		get: (key: string) => Local.get!(key),
		createGetter: (key: string) => Local.createGetter!(key)
	},
	commandSuggestion: {
		searcher: () => CommandSuggestion.searcher
	},
	eventEditor: {
		openGlobalEvent: (id: string) => EventEditor.openGlobalEvent!(id)
	},
	searchString: {
		open: (list: any) => SearchString.open(list)
	},
	menuPopup: (popupOptions: any, items: any[]) => Menu.popup(popupOptions, items),
	getVariable,
	ctrl: (key: string) => ctrl(key),
	setTooltip: (el: HTMLElement, tip: string) => setTooltip(el, tip)
};

interface CommandListStaticsType {
	alphabetCode: RegExp;
	highlightedTexts: HTMLElement[];
	highlightTexts: (data: any) => void;
	unhighlightTexts: () => void;
	textPointerenter: (event: any) => void;
	textPointerleave: (event: any) => void;
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
