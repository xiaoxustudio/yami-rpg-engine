<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { YMNavBar, YMButton } from '@ui-kit';
interface NavBarApi extends HTMLElement {
	[k: string]: unknown;
	read(): unknown;
	write(value: unknown): void;
	unselect(): void;
	on(
		type: string,
		listener: (event: Event) => void,
		options?: boolean | AddEventListenerOptions
	): void;
}

const navRef = ref<InstanceType<typeof YMNavBar> | null>(null);
const current = ref('(none)');

onMounted(() => {
	const el = navRef.value?.root as NavBarApi | null;
	if (!el) return;
	el.on('select', (event: Event) => {
		current.value = String((event as Event & { value?: unknown }).value);
	});
});

const selectScene = (): void => {
	navRef.value?.write('scene');
	current.value = 'scene';
};

const unselect = (): void => {
	navRef.value?.unselect();
	current.value = '(none)';
};
</script>

<template>
	<section>
		<h2>YMNavBar</h2>
		<p class="desc">标签导航条；点击 .nav-item 切换选中项，支持 write/unselect 命令式操作。</p>
		<div class="row">
			<YMButton size="sm" @click="selectScene">Select "scene"</YMButton>
			<YMButton size="sm" @click="unselect">Unselect</YMButton>
			<span class="hint">selected: {{ current }}</span>
		</div>
		<div class="stage">
			<YMNavBar ref="navRef">
				<div class="nav-item" value="scene"><span class="nav-text">Scene</span></div>
				<div class="nav-item" value="events"><span class="nav-text">Events</span></div>
				<div class="nav-item" value="plugins"><span class="nav-text">Plugins</span></div>
			</YMNavBar>
		</div>
	</section>
</template>

<style scoped>
.stage {
	position: relative;
	margin-top: var(--ym-space-3);
	width: 360px;
	height: 25px;
	background-color: var(--ym-color-surface);
	border: 1px solid var(--ym-color-border);
}
</style>
