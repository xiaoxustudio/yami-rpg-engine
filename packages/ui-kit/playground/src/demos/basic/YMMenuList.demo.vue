<script setup lang="ts">
import { ref } from 'vue';
import { YMMenuList, type MenuItem, YMButton } from '@ui-kit';
const menuRef = ref<InstanceType<typeof YMMenuList> | null>(null);
const lastAction = ref('(none)');
const gridChecked = ref(true);

const buildItems = (): MenuItem[] => [
	{ label: 'Open File', accelerator: 'Ctrl+O', click: () => (lastAction.value = 'Open File') },
	{ label: 'Save', accelerator: 'Ctrl+S', enabled: false },
	{ type: 'separator' },
	{
		label: 'View',
		submenu: [
			{
				label: 'Zoom In',
				accelerator: 'Ctrl++',
				click: () => (lastAction.value = 'View > Zoom In')
			},
			{
				label: 'Zoom Out',
				accelerator: 'Ctrl+-',
				click: () => (lastAction.value = 'View > Zoom Out')
			}
		]
	},
	{
		label: 'Show Grid',
		checked: gridChecked.value,
		click: () => {
			gridChecked.value = !gridChecked.value;
			lastAction.value = `Show Grid: ${gridChecked.value}`;
		}
	},
	{ type: 'separator' },
	{ label: 'Exit', click: () => (lastAction.value = 'Exit') }
];

const openAt = (event: MouseEvent): void => {
	menuRef.value?.popup({ x: event.clientX, y: event.clientY, minWidth: 180 }, buildItems());
};
</script>

<template>
	<section>
		<h2>YMMenuList</h2>
		<p class="desc">点击按钮或右键下方区域弹出菜单；支持快捷键、禁用、勾选与子菜单。</p>
		<div class="row">
			<YMButton variant="primary" @click="openAt">Open Menu</YMButton>
			<span class="hint">last action: {{ lastAction }}</span>
		</div>
		<div class="target" @contextmenu.prevent="openAt">Right-click here</div>
		<YMMenuList ref="menuRef" />
	</section>
</template>

<style scoped>
.target {
	display: flex;
	align-items: center;
	justify-content: center;
	margin-top: var(--ym-space-3);
	width: 280px;
	height: 96px;
	color: var(--ym-color-text-unit);
	font-size: var(--ym-font-size-sm);
	background-color: var(--ym-color-surface-hover);
	border: 1px dashed var(--ym-color-border);
	user-select: none;
}
</style>
