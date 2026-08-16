import type { EditorConfigShape, EditorProjectShape } from '@app/stores/editor';
import { getEditorStore } from '@app/stores/editor';

type EditorState = 'closed' | 'open';

// 通用可空方法契约（运行时挂载的具体方法签名各异，统一用宽类型）
type EditorMethod = ((...args: any[]) => any) | null;

export interface EditorProjectHooks {
	onWindowSaveDispatch: () => void;
	onWindowConfirm: (
		options: { message?: string; close?: () => void },
		items: Array<{ label?: string; click?: () => void }>
	) => void;
	onTitleChanged: () => void;
	saveToConfig: (config: EditorConfigShape) => void;
	loadFromConfig: (config: EditorConfigShape) => void;
	saveToProject: (project: EditorProjectShape) => void;
	loadFromProject: (project: EditorProjectShape) => void;
	onError: (error: unknown) => void;
}

interface EditorShape {
	state: EditorState;
	config: EditorConfigShape | null;
	project: EditorProjectShape | null;
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
	hooks: EditorProjectHooks;
}

export const Editor: EditorShape = {
	get state(): EditorState {
		return getEditorStore().state;
	},
	set state(value: EditorState) {
		getEditorStore().setState(value);
	},
	get config(): EditorConfigShape | null {
		return getEditorStore().config;
	},
	set config(value: EditorConfigShape | null) {
		getEditorStore().setConfig(value);
	},
	get project(): EditorProjectShape | null {
		return getEditorStore().project;
	},
	set project(value: EditorProjectShape | null) {
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
	isProjectVersionSupported: null,
	hooks: null as unknown as EditorProjectHooks
};

export function setEditorProjectHooks(hooks: EditorProjectHooks) {
	Editor.hooks = hooks;
}
