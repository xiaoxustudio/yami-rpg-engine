import { defineStore } from 'pinia';
import { Localization } from '@app/local/local-window.ts';
import type { EditorProjectShape } from './editor';
import { shallowRef } from 'vue';
import { pinia } from './pinia';
import type { LocalizationItem, LocalizationTarget } from '@app/local/local-window.ts';
import type { History } from '@app/tools/history.ts';

type LocalizationItemShape = {
	id?: string;
	name: string;
	class?: string;
	expanded?: boolean;
	children?: LocalizationItemShape[];
	contents?: Record<string, string>;
};

/**
 * 与 `Localization` 单例桥接的状态键（`local/local-window.ts` 的 `localizationBridgeKeys` 必须同值）。
 *
 * ⚠️ 单例侧另有一份同名数组而不是 import 这一份：桥接循环在**模块求值期**读数组，而
 * `stores/localization.ts` 又要 import `Localization`（单例）⇒ 直接互相 import 会踩 TDZ。
 * 两份数组因此必须一起改（本仓多数域都是这个形态；「桥接列表 vs *StateKeys」的口径见 `stores/pinia.ts` 约定 §3）。
 */
export const localizationStateKeys = [
	'state',
	'strings',
	'target',
	'data',
	'languages',
	'history',
	'changed'
] as const;

export const useLocalizationStore = defineStore('localization', () => {
	const state = shallowRef<string>('closed');
	const strings = shallowRef<Record<string, string>>({});
	// ── 本批从单例侧「升」上来的 5 个键（原先只在 Localization 对象上）────────────
	/** 打开窗口时带进来的回调宿主（`open(target)`），关闭时要按它判断是否残留在编辑态 */
	const target = shallowRef<LocalizationTarget | null>(null);
	/** 本地化词条树（当前编辑缓冲） */
	const data = shallowRef<LocalizationItem[] | null>(null);
	/** 语言列表（列 = 语言） */
	const languages = shallowRef<string[] | null>(null);
	/** 撤销/重做栈 */
	const history = shallowRef<History | null>(null);
	/** 是否有未保存改动 */
	const changed = shallowRef<boolean>(false);

	function initialize() {
		Localization?.initialize?.();
	}

	function open(target?: { input?: (id: string) => void }) {
		Localization?.open?.(target);
	}

	function close() {
		Localization?.close?.();
	}

	function undo() {
		Localization?.undo?.();
	}

	function redo() {
		Localization?.redo?.();
	}

	function createId() {
		return Localization?.createId?.();
	}

	function register(item: LocalizationItemShape) {
		Localization?.register?.(item);
	}

	function unregister(item: LocalizationItemShape) {
		Localization?.unregister?.(item);
	}

	function openContentPanel(item: LocalizationItemShape) {
		Localization?.openContentPanel?.(item);
	}

	function closeContentPanel() {
		Localization?.closeContentPanel?.();
	}

	function confirm(event?: Event) {
		Localization?.confirm?.(event);
	}

	function apply(event?: Event) {
		Localization?.apply?.(event);
	}

	function toExcel(event?: Event) {
		Localization?.toExcel?.(event);
	}

	function saveToProject(project: EditorProjectShape) {
		Localization?.saveToProject?.(project);
	}

	function loadFromProject(project: EditorProjectShape) {
		Localization?.loadFromProject?.(project);
	}

	return {
		state,
		strings,
		target,
		data,
		languages,
		history,
		changed,
		initialize,
		open,
		close,
		undo,
		redo,
		createId,
		register,
		unregister,
		openContentPanel,
		closeContentPanel,
		confirm,
		apply,
		toExcel,
		saveToProject,
		loadFromProject
	};
});

export function getLocalizationStore() {
	return useLocalizationStore(pinia);
}
