<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { YMTreeList, treeListStatics, YMButton } from '@ui-kit';
interface TreeNode {
	name: string;
	class?: string;
	children?: TreeNode[];
	expanded?: boolean;
}

interface TreeListApi extends HTMLElement {
	// oxlint-disable-next-line no-explicit-any
	[k: string]: any;
}

const treeRef = ref<InstanceType<typeof YMTreeList> | null>(null);
const selectedName = ref('(none)');

const treeData = ref<TreeNode[]>([
	{
		name: 'Map',
		class: 'folder',
		expanded: true,
		children: [
			{
				name: 'Ground',
				class: 'folder',
				expanded: true,
				children: [{ name: 'Grass Tile' }, { name: 'Dirt Tile' }]
			},
			{
				name: 'Objects',
				class: 'folder',
				expanded: false,
				children: [{ name: 'Chest' }, { name: 'Torch' }]
			}
		]
	},
	{
		name: 'Characters',
		class: 'folder',
		expanded: true,
		children: [{ name: 'Hero' }, { name: 'Villager' }]
	},
	{ name: 'README' }
]);

const getEl = (): TreeListApi | null => (treeRef.value?.$el as TreeListApi | null) ?? null;

const onSelect = (event: Event & { value?: unknown }): void => {
	selectedName.value = (event.value as TreeNode | null)?.name ?? '(none)';
};

onMounted(() => {
	const el = getEl();
	if (!el) return;
	el.bind(() => treeData.value);
	el.removable = true;
	el.renamable = true;
	el.lockDirectory = false;
	el.multipleSelect = false;
	el.on('select', onSelect);
	el.update();
});

onUnmounted(() => {
	treeListStatics.deleteCaches(treeData.value);
});

const addFolder = (): void => {
	getEl()?.addNodeTo(
		{ name: `Folder ${treeData.value.length + 1}`, class: 'folder', children: [] },
		null
	);
};

const addLeaf = (): void => {
	const el = getEl();
	if (!el) return;
	el.addNodeTo({ name: 'New Node' }, el.read());
};

const deleteSelected = (): void => {
	const el = getEl();
	if (!el) return;
	el.deleteNode(el.read());
};

const renameSelected = (): void => {
	const el = getEl();
	if (!el) return;
	el.focus();
	el.rename(el.read());
};

const toggleExpand = (): void => {
	getEl()?.expandSelection();
};
</script>

<template>
	<section>
		<h2>YMTreeList</h2>
		<p class="desc">树形列表；支持展开/折叠、选中、重命名（F2）、拖拽与增删节点。</p>
		<div class="row">
			<YMButton size="sm" @click="addFolder">Add Folder</YMButton>
			<YMButton size="sm" @click="addLeaf">Add Node</YMButton>
			<YMButton size="sm" @click="renameSelected">Rename</YMButton>
			<YMButton size="sm" @click="toggleExpand">Expand/Collapse</YMButton>
			<YMButton size="sm" variant="danger" @click="deleteSelected">Delete</YMButton>
			<span class="hint">selected: {{ selectedName }}</span>
		</div>
		<div class="stage">
			<YMTreeList ref="treeRef" padded />
		</div>
	</section>
</template>

<style scoped>
.stage {
	position: relative;
	margin-top: var(--ym-space-3);
	width: 320px;
	height: 240px;
	background-color: var(--ym-color-input-bg);
	border: 1px solid var(--ym-color-border);
}
</style>
