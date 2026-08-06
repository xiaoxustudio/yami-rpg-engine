import { defineStore } from 'pinia';
import { shallowRef } from 'vue';
import { pinia } from './pinia';

type EditorState = 'closed' | 'open';

// Phase 10——逐步补齐类型：Editor.config 结构（已知字段枚举——未枚举字段宽兜底，随迁移收紧）
export interface EditorConfigShape {
	language?: string;
	version?: string;
	project?: string;
	projectPath?: string;
	zoom?: number;
	recent?: any[];
	scriptEditor?: { mode?: string; path?: string };
	dialogs?: Record<string, any>;
	[key: string]: any;
}

// Editor.project 结构（宽类型起步——字段随迁移细化）
export interface EditorProjectShape {
	version?: string;
	scene?: any;
	uiPrefabs?: any;
	openEvents?: any;
	recentTabs?: any;
	[key: string]: any;
}

export const useEditorStore = defineStore('editor', () => {
	const config = shallowRef<EditorConfigShape | null>(null);
	const project = shallowRef<EditorProjectShape | null>(null);
	const state = shallowRef<EditorState>('closed');

	function setConfig(value: EditorConfigShape | null) {
		config.value = value;
	}

	function setProject(value: EditorProjectShape | null) {
		project.value = value;
	}

	function setState(value: EditorState) {
		state.value = value;
	}

	return { config, project, state, setConfig, setProject, setState };
});

export function getEditorStore() {
	return useEditorStore(pinia);
}
