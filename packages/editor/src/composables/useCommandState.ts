import { reactive } from 'vue';
import type { WordListShape } from './useWordList.ts';

interface CommandTargetShape {
	scrollAndResize?: () => void;
	getSelectionPosition?: () => { x: number; y: number } | null;
	save?: (data: { id: string; params: Record<string, unknown> }) => unknown;
}

interface CommandState {
	target: CommandTargetShape | null;
	id: string;
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
	id: null as unknown as string,
	words: null as unknown as WordListShape,
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
