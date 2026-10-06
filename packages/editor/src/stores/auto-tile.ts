import { defineStore } from 'pinia';
import { ref, shallowRef } from 'vue';
import { pinia } from './pinia';

/**
 * store 的状态键。
 *
 * 与 `palette/auto-tile.ts:1096` 的 `autoTileBridgeKeys`（8 个：templates…changed）**不是同一份**，
 * 且这是**有意**的：这里多一个 `ruleBits` —— 它是纯 store 侧派生数据，`palette/auto-tile.ts:761`
 * 与 `:886` 直接读 `getAutoTileStore().ruleBits`，单例 `AutoTile` 上没有对应字段，故不桥。
 *
 * 历史：原本这里还有 `state` / `target` 两个浅引用，但**两端都没有读写者**（生产代码零读取，
 * 单例侧也没有同名字段）—— 已删除，不再留「状态反转」的假象。
 */
export const autoTileStateKeys = [
	'templates',
	'template',
	'nodeIndex',
	'frameIndex',
	'offsetX',
	'offsetY',
	'imageId',
	'changed',
	'ruleBits'
] as const;

export const useAutoTileStore = defineStore('autoTile', () => {
	// oxlint-disable-next-line no-explicit-any
	const templates = shallowRef<any>(null);
	// oxlint-disable-next-line no-explicit-any
	const template = shallowRef<any>(null);
	// oxlint-disable-next-line no-explicit-any
	const nodeIndex = shallowRef<any>(null);
	// oxlint-disable-next-line no-explicit-any
	const frameIndex = shallowRef<any>(null);
	// oxlint-disable-next-line no-explicit-any
	const offsetX = shallowRef<any>(null);
	// oxlint-disable-next-line no-explicit-any
	const offsetY = shallowRef<any>(null);
	const imageId = shallowRef<string | null>(null);
	const changed = shallowRef<boolean>(false);
	const ruleBits = ref([0, 0, 0, 0, 0, 0, 0, 0]);

	return {
		templates,
		template,
		nodeIndex,
		frameIndex,
		offsetX,
		offsetY,
		imageId,
		changed,
		ruleBits
	};
});

export function getAutoTileStore() {
	return useAutoTileStore(pinia);
}
