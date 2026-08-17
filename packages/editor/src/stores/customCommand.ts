import { defineStore } from 'pinia';
import {
	CustomCommand,
	type CustomCommandData
} from '@app/legacy/command/custom-command-window.ts';
import type { EditorProjectShape } from './editor';
import { shallowRef } from 'vue';
import { pinia } from './pinia';

export const customCommandStateKeys = ['state', 'commands'] as const;

export const useCustomCommandStore = defineStore('customCommand', () => {
	const state = shallowRef<string>('closed');
	const commands = shallowRef<CustomCommandData[]>([]);

	function initialize() {
		CustomCommand?.initialize?.();
	}

	function open() {
		CustomCommand?.open?.();
	}

	function close() {
		CustomCommand?.close?.();
	}

	function unload() {
		CustomCommand?.unload?.();
	}

	function loadOverview() {
		CustomCommand?.loadOverview?.();
	}

	function createData(id: string) {
		return CustomCommand?.createData?.(id);
	}

	function confirm(event?: Event) {
		CustomCommand?.confirm?.(event!);
	}

	function apply(event?: Event) {
		CustomCommand?.apply?.(event!);
	}

	function saveToProject(project: EditorProjectShape) {
		CustomCommand?.saveToProject?.(project);
	}

	function loadFromProject(project: EditorProjectShape) {
		CustomCommand?.loadFromProject?.(project);
	}

	return {
		state,
		commands,
		initialize,
		open,
		close,
		unload,
		loadOverview,
		createData,
		confirm,
		apply,
		saveToProject,
		loadFromProject
	};
});

export function getCustomCommandStore() {
	return useCustomCommandStore(pinia);
}
