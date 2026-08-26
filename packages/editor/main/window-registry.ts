import type { BrowserWindow } from 'electron';
import type { BrowserWindowExtension } from './types/main.ts';

let editorWindow: (BrowserWindow & BrowserWindowExtension) | null = null;

export const setEditorWindow = function (window: (BrowserWindow & BrowserWindowExtension) | null) {
	editorWindow = window;
};

export const getEditorWindow = function (): (BrowserWindow & BrowserWindowExtension) | null {
	return editorWindow;
};

export const isEditorAlive = function (): boolean {
	return editorWindow !== null && !editorWindow.isDestroyed();
};
