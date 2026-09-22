<script setup lang="ts">
import { YMButton, YMTitleBar, YMWindowFrame } from '@ui-kit';

type FrameElement = HTMLElement & { open?(): void; close?(): boolean };

const openDialog = (id: string) => (document.getElementById(id) as FrameElement | null)?.open?.();
const closeDialog = (id: string) => (document.getElementById(id) as FrameElement | null)?.close?.();
</script>

<template>
	<section class="demo">
		<h2>YMTitleBar</h2>
		<p class="desc">
			标题栏：按住拖动窗口、双击最大化、点击 .close / .maximize 按钮执行对应操作。
		</p>
		<div class="row">
			<YMButton variant="primary" @click="openDialog('tb-demo-1')"
				>Open Draggable Window</YMButton
			>
		</div>
		<YMWindowFrame id="tb-demo-1" mode="center">
			<template #title>
				<YMTitleBar>
					Drag me
					<div class="minimize" />
					<div class="maximize" />
					<div class="close" />
				</YMTitleBar>
			</template>
			<div class="frame-content">
				<p>
					Drag the title bar to move, double click to maximize, use buttons on the right.
				</p>
				<YMButton @click="closeDialog('tb-demo-1')">Close</YMButton>
			</div>
		</YMWindowFrame>
	</section>
</template>

<style scoped>
.demo {
	margin-bottom: 24px;
}

.row {
	display: flex;
	align-items: center;
	flex-wrap: wrap;
	gap: 12px;
	margin: 8px 0;
}

.desc {
	color: var(--ym-color-text);
	opacity: 0.7;
	font-size: 0.9em;
	margin: 4px 0;
}

.frame-content {
	padding: 12px;
	font-family: var(--ym-font-sans);
	color: var(--ym-color-text);
}

.demo :deep(#tb-demo-1) {
	width: 300px;
	height: 120px;
}
</style>
