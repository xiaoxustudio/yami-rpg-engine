import { defineStore } from 'pinia';
import { EventEditor } from '@app/commands/event-editor.ts';
import { markRaw, reactive, shallowRef } from 'vue';
import { WordList, type WordListShape } from '@ui-kit';
import { pinia } from './pinia';

export const commandStateKeys = ['state', 'target'] as const;

/** 命令解析目标（原在 `composables/useCommandState.ts`） */
export interface CommandTargetShape {
	scrollAndResize?: () => void;
	getSelectionPosition?: () => { x: number; y: number } | null;
	save?: (data: { id: string; params: Record<string, unknown> }) => unknown;
}

/**
 * 指令解析态（原 `composables/useCommandState.ts:42` 的模块级 `reactive`，现为 store 状态）。
 *
 * 为什么升进 store：它是命令编辑器最热的一份共享状态（94 处 `commandState.x` 引用），
 * 放在模块作用域既进不了 DevTools，也没法按 pinia 实例隔离；`stores/command.ts` 过去只有
 * `state`/`target` 两个**没有 writer** 的浅引用（`commandStateKeys`），真状态反而在 composable 里。
 */
export interface CommandParseState {
	target: CommandTargetShape | null;
	/** 指令 id：解析阶段才写入，之前**确实是 null** */
	id: string | null;
	/**
	 * 词表：默认是一个空 `WordList`；每次解析由
	 * `Command.words = markRaw(new Command.WordList())` 换成**新实例**，schema 解析函数在开头
	 * `const words = commandState.words` 抓住它、随后连续 `push`。
	 *
	 * `markRaw` 不能省：`WordList` 内部用私有字段 `#arr`，被 Vue 包成 Proxy 后一调用就抛
	 * （`Cannot read private member #arr from an object whose class did not declare it`）。
	 */
	words: WordListShape;
	invalid: boolean;
	saveVars: boolean;
	returnType: string;
	eventName: string;
	eventIndex: number;
	variables: Array<{
		name: string;
		type: string;
		comment: string;
		evIndex: number;
		isLeftValue: boolean;
		refCount: number;
		command?: unknown;
	}>;
	varMap: Record<string, unknown>;
	dependsOn: string[];
	currentCommand: Record<string, unknown> | null;
}

export const useCommandStore = defineStore('command', () => {
	const state = shallowRef<string>('closed');
	const target = shallowRef<Record<string, unknown> | null>(null);

	// ── 指令解析态（真源）────────────────────────────────────────────────
	// 用 `reactive`（而不是逐字段 `shallowRef`）：解析期对 `variables`/`varMap` 做就地读写，
	// 与原先模块级 `reactive` 的语义逐字对齐；`words` 走 `markRaw`（见类型注释）。
	// `composables/useCommandState.ts` 仍导出同名 `commandState` 对象，但改成逐字段访问器，
	// 所以 94 处调用点不用改。
	const parse = reactive<CommandParseState>({
		target: null,
		id: null,
		words: markRaw(new WordList()),
		invalid: false,
		saveVars: false,
		returnType: '',
		eventName: '',
		eventIndex: 0,
		variables: [],
		varMap: {},
		dependsOn: ['Inspector'],
		currentCommand: null
	});

	function initialize() {
		EventEditor?.initialize?.();
	}

	function open(target: string) {
		EventEditor?.open?.(target);
	}

	function close() {
		EventEditor?.close?.();
	}

	function planToSave() {
		EventEditor?.planToSave?.();
	}

	function openLocalEvent(
		inserting: boolean,
		filter: string,
		name: string,
		event: unknown,
		callback: (() => void) | null
	) {
		EventEditor?.openLocalEvent?.(inserting, filter, name, event, callback);
	}

	function openGlobalEvent(guid: string) {
		EventEditor?.openGlobalEvent?.(guid);
	}

	function openRelatedEvents(contexts: unknown[]) {
		EventEditor?.openRelatedEvents?.(contexts);
	}

	function findRelatedEvents(eventId: string) {
		return EventEditor?.findRelatedEvents?.(eventId);
	}

	function getAllLocalEvents() {
		return EventEditor?.getAllLocalEvents?.();
	}

	function clearAllEventClasses(...items: unknown[]) {
		return EventEditor?.clearAllEventClasses?.(...items);
	}

	function clearRelatedEventClasses(...items: unknown[]) {
		return EventEditor?.clearRelatedEventClasses?.(...items);
	}

	function save(item: unknown) {
		EventEditor?.save?.(item);
	}

	function isChanged() {
		return EventEditor?.isChanged?.();
	}

	function getItemById(id: string) {
		return EventEditor?.getItemById?.(id);
	}

	function getItemByEvent(event: unknown) {
		return EventEditor?.getItemByEvent?.(event);
	}

	function openCommandList(item: unknown) {
		EventEditor?.openCommandList?.(item);
	}

	function closeCommandList() {
		EventEditor?.closeCommandList?.();
	}

	function unpackOpenEvents() {
		return EventEditor?.unpackOpenEvents?.();
	}

	function packOpenEvents() {
		return EventEditor?.packOpenEvents?.();
	}

	function getGlobalEventName(id: string) {
		return EventEditor?.getGlobalEventName?.(id);
	}

	function confirm(event?: Event) {
		EventEditor?.confirm?.(event);
	}

	function apply(event?: Event) {
		EventEditor?.apply?.(event);
	}

	return {
		state,
		target,
		parse,
		initialize,
		open,
		close,
		planToSave,
		openLocalEvent,
		openGlobalEvent,
		openRelatedEvents,
		findRelatedEvents,
		getAllLocalEvents,
		clearAllEventClasses,
		clearRelatedEventClasses,
		save,
		isChanged,
		getItemById,
		getItemByEvent,
		openCommandList,
		closeCommandList,
		unpackOpenEvents,
		packOpenEvents,
		getGlobalEventName,
		confirm,
		apply
	};
});

export function getCommandStore() {
	return useCommandStore(pinia);
}
