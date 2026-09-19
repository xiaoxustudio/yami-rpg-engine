import { markRaw, reactive } from 'vue';
import { WordList, type WordListShape } from './useWordList.ts';

interface CommandTargetShape {
	scrollAndResize?: () => void;
	getSelectionPosition?: () => { x: number; y: number } | null;
	save?: (data: { id: string; params: Record<string, unknown> }) => unknown;
}

interface CommandState {
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

export const commandState = reactive<CommandState>({
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

export type { CommandState, CommandTargetShape };
