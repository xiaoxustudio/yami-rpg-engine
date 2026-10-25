import { defineStore } from 'pinia';
import { shallowRef } from 'vue';
import { pinia } from './pinia';

export type ResourcePhase = 'idle' | 'downloading' | 'decompressing';

export interface ResourceRow {
	key: string;
	value: string;
	version: string;
	remoteVersion?: string;
	updateAvailable?: boolean;
	installed: boolean;
	hasTemp: boolean;
	sizeText: string;
	speedText: string;
	progress: number;
	phase: ResourcePhase;
}

export const resourceStateKeys = ['rows', 'nodeText', 'pingText', 'pingColor'] as const;

export const useResourceStore = defineStore('resource', () => {
	const rows = shallowRef<ResourceRow[]>([]);
	const nodeText = shallowRef('当前节点: 加载中...');
	const pingText = shallowRef('Ping: --');
	const pingColor = shallowRef('var(--text-color-weak)');

	function setRows(value: ResourceRow[]): void {
		rows.value = value;
	}

	function patchRow(key: string, patch: Partial<ResourceRow>): void {
		rows.value = rows.value.map((row) => (row.key === key ? { ...row, ...patch } : row));
	}

	function setNodeText(value: string): void {
		nodeText.value = value;
	}

	function setPing(text: string, color: string): void {
		pingText.value = text;
		pingColor.value = color;
	}

	function reset(): void {
		rows.value = [];
		nodeText.value = '当前节点: 加载中...';
		pingText.value = 'Ping: --';
		pingColor.value = 'var(--text-color-weak)';
	}

	return {
		rows,
		nodeText,
		pingText,
		pingColor,
		setRows,
		patchRow,
		setNodeText,
		setPing,
		reset
	};
});

export function getResourceStore() {
	return useResourceStore(pinia);
}
