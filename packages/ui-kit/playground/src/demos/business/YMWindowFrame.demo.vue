<script setup lang="ts">
import { YMButton, YMTitleBar, YMWindowFrame } from '@ui-kit';

type FrameElement = HTMLElement & { open?(): void; close?(): boolean; maximize?(): void };

const openDialog = (id: string) => (document.getElementById(id) as FrameElement | null)?.open?.();
const closeDialog = (id: string) => (document.getElementById(id) as FrameElement | null)?.close?.();
const maximizeDialog = (id: string) => (document.getElementById(id) as FrameElement | null)?.maximize?.();

const closeAll = () => {
	const frames = (window as Window & { Window?: { frames?: HTMLElement[] } }).Window?.frames ?? [];
	for (const frame of frames) {
		frame.classList.remove('open');
	}
	frames.length = 0;
};
</script>

<template>
	<section class="demo">
		<h2>YMWindowFrame</h2>
		<p class="desc">窗口框架，依赖 window.Window host 挂载到 body；支持 open/close/maximize，可拖动标题栏移动。</p>
		<div class="row">
			<YMButton variant="primary" @click="openDialog('wf-demo-1')">Open Center Window</YMButton>
			<YMButton @click="openDialog('wf-demo-2')">Open Window (Apply)</YMButton>
			<YMButton variant="danger" @click="closeAll">Close All</YMButton>
		</div>
		<div class="row">
			<YMButton @click="maximizeDialog('wf-demo-1')">Maximize</YMButton>
			<YMButton @click="closeDialog('wf-demo-1')">Close</YMButton>
		</div>
		<YMWindowFrame id="wf-demo-1" mode="center">
			<template #title>
				<YMTitleBar>
					Demo Window 1
					<div class="maximize" />
					<div class="close" />
				</YMTitleBar>
			</template>
			<div class="frame-content">
				<p>Centered window frame with drag &amp; drop title bar.</p>
				<YMButton @click="closeDialog('wf-demo-1')">Close me</YMButton>
			</div>
		</YMWindowFrame>
		<YMWindowFrame id="wf-demo-2" mode="overlap" show-apply>
			<template #title>
				<YMTitleBar>
					Demo Window 2
					<div class="maximize" />
					<div class="close" />
				</YMTitleBar>
			</template>
			<div class="frame-content">
				<p>Window with Apply button (show-apply), cascaded from the previous one.</p>
				<YMButton @click="closeDialog('wf-demo-2')">Cancel</YMButton>
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

.demo :deep(#wf-demo-1),
.demo :deep(#wf-demo-2) {
	width: 300px;
	height: 120px;
}
</style>
