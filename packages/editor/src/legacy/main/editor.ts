type EditorState = 'closed' | 'open';

// 通用可空方法契约（运行时挂载的具体方法签名各异，统一用宽类型）
type EditorMethod = ((...args: any[]) => any) | null;

interface EditorShape {
	state: EditorState;
	config: any | null;
	project: any | null;
	initialize: (() => void) | null;
	open: EditorMethod;
	close: EditorMethod;
	quit: EditorMethod;
	updatePath: EditorMethod;
	switchHotkey: EditorMethod;
	saveConfig: EditorMethod;
	loadConfig: EditorMethod;
	saveProject: EditorMethod;
	loadProject: EditorMethod;
	saveManifest: EditorMethod;
	checkForEditorUpdates: EditorMethod;
	checkForProjectUpdates: EditorMethod;
	isProjectVersionSupported: EditorMethod;
}

import { getEditorStore } from '@app/stores/editor';

export const Editor: EditorShape = {
	state: 'closed',
	// config/project 经 Pinia store 承载（Phase 10——DOM 全面 Vue 化——状态先行）
	get config(): any {
		return getEditorStore().config;
	},
	set config(value: any) {
		getEditorStore().setConfig(value);
	},
	get project(): any {
		return getEditorStore().project;
	},
	set project(value: any) {
		getEditorStore().setProject(value);
	},
	initialize: null,
	open: null,
	close: null,
	quit: null,
	updatePath: null,
	switchHotkey: null,
	saveConfig: null,
	loadConfig: null,
	saveProject: null,
	loadProject: null,
	saveManifest: null,
	checkForEditorUpdates: null,
	checkForProjectUpdates: null,
	isProjectVersionSupported: null
};

// ESM 迁移兼容：恢复全局绑定（供尚未迁移的文件裸用）
(window as any).Editor = Editor;
