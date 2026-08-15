import { defineStore } from 'pinia';
import { Localization } from '@/local/local-window.ts';
import type { EditorProjectShape } from './editor';
import { shallowRef } from 'vue';
import { pinia } from './pinia';

type LocalizationItemShape = {
	id?: string;
	name: string;
	class?: string;
	expanded?: boolean;
	children?: LocalizationItemShape[];
	contents?: Record<string, string>;
	element?: HTMLElement & { initText?: HTMLElement; attrValue?: string };
};

export const localizationStateKeys = ['state', 'strings'] as const;

export const useLocalizationStore = defineStore('localization', () => {
	const state = shallowRef<string>('closed');
	const strings = shallowRef<Record<string, string>>({});

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
