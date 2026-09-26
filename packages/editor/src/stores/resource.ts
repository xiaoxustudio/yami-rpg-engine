import { defineStore } from 'pinia';
import { shallowRef } from 'vue';
import { pinia } from './pinia';

export type ResourcePhase = 'idle' | 'downloading' | 'decompressing';

/**
 * 资源包行数据：原先在 module/resource.ts 的 `temp()` 里用 DOMParser 解析
 * 一段 HTML 模板字符串、再逐个按 id 取子节点并挂事件，现在改成这份模型 +
 * `ResourceList.vue` 的 v-for 渲染。
 */
export interface ResourceRow {
	/** 原始包名，如 `arpg-ts-english`（用于模板目录与下载地址） */
	key: string;
	/** id 安全形式（点替换为下划线），仅用于 DOM id 与左侧显示 */
	value: string;
	/** 版本输入框内容（已安装时形如 `v1.0.0`，未安装为空串） */
	version: string;
	/** `NoResourceObj[key].check`：Templates/<key> 已存在 */
	installed: boolean;
	/** 模板目录是否存在（未安装时决定删除按钮是否可用） */
	hasTemp: boolean;
	/** 「大小: …」一行 */
	sizeText: string;
	/** 「速度: …」一行（下载中会更新） */
	speedText: string;
	/** 0~100 */
	progress: number;
	/** idle=可下载 / downloading=下载中（显示暂停） / decompressing=解压中 */
	phase: ResourcePhase;
}

export const resourceStateKeys = ['rows', 'nodeText', 'pingText', 'pingColor'] as const;

export const useResourceStore = defineStore('resource', () => {
	const rows = shallowRef<ResourceRow[]>([]);
	// 初值与 Resource.vue 里原来的占位文案一致
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
