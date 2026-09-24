import { commandListPrototype, commandListStatics, type CommandListApiOptions } from '@ui-kit';
import type { MenuItem, MenuOptions } from '@ui-kit';
import { SettingConfig } from '@app/services/project/setting-config';
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
import { SearchString } from '@app/stores/search-string';
import { getLocalStore } from '@app/stores/local';
import { getYamiI18n } from '@app/i18n';
import { setTooltip } from '@app/utils/element-utils.ts';
import { GlobalClipboard } from '@app/utils/clipboard';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});

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
	// 第 162 轮：上游形状补齐后**重审这处登记保留项** —— `SettingConfigShape.other` 现在显式声明了
	// `copyAsTextKeepEmptyLine: boolean`，所以 `SettingConfig` 直接满足 ui-kit 的
	// `settingConfig` 契约（`command-api.ts:231`），原来的 `as unknown as` **整段去掉**。
	// （手法库第 148/155 条：登记为「保留」的断言要随上游变化重审，不是永久豁免。）
	settingConfig: SettingConfig,
	localize: {
		language: () => getLocalStore().language,
		get: (key: string) => t(key),
		createGetter: (key: string) => (sub: string) => t(key + '.' + sub)
	},
	commandSuggestion: {
		searcher: () => CommandSuggestion.searcher
	},
	eventEditor: {
		openGlobalEvent: (id: string) => EventEditor.openGlobalEvent!(id)
	},
	searchString: {
		open: (list: HTMLElement) =>
			// 交叉断言（手法库第 6 条）：保留对象类型、只补缺口那一支。契约（ui-kit
			// `command-api.ts:237`）只承诺 `HTMLElement`，而 `SearchString.open` 要的是
			// `SearchableList` —— 运行期那个对象两样都是（它正是命令列表元素：`elements` /
			// `findString` / `scrollToRow` 都在 `command-api.ts` 上）。用 `unknown` 跳板会让
			// **任何**目标类型都能通过；交叉断言则要求目标确实是源类型的扩展。
			SearchString.open(list as HTMLElement & Parameters<typeof SearchString.open>[0])
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
	// oxlint-disable-next-line no-explicit-any
	prototype: Record<string, (...args: any[]) => any>;
}

export const CommandList: CommandListStaticsType = {
	alphabetCode: commandListStatics.alphabetCode,
	highlightedTexts: commandListStatics.highlightedTexts,
	// oxlint-disable-next-line unbound-method
	highlightTexts: commandListStatics.highlightTexts,
	// oxlint-disable-next-line unbound-method
	unhighlightTexts: commandListStatics.unhighlightTexts,
	// oxlint-disable-next-line unbound-method
	textPointerenter: commandListStatics.textPointerenter,
	// oxlint-disable-next-line unbound-method
	textPointerleave: commandListStatics.textPointerleave,
	prototype: commandListPrototype
};

export const commandListOptions = options as CommandListApiOptions;

// M5 收尾（2026-09-17）：删掉两个从未被调用的转发函数
//   - `attachCommandListApi(el)`：元素 API 的装载现在由 `YMCommandList.vue` 自己经
//     `createCommandListApi` 完成，这条转发没有消费者；
//   - `createCommandList()`：全仓 0 调用（列表一律经 `<CommandList>` 组件 / `YMCommandList` 装载）。
// 二者都是"巨石换源"（M3/M4）之后遗留的旧入口。
