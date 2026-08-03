<script setup lang="ts">
import UiButton from '../../src/components/basic/UiButton/UiButton.vue';
import ThemeProvider from '../../src/theme/ThemeProvider.vue';

const click = (msg: string) => () => {
	console.log('[ui-kit playground] click:', msg);
};
</script>

<template>
	<ThemeProvider>
		<div class="page">
			<h1>@yami/ui-kit Playground</h1>
			<section>
				<h2>UiButton</h2>
				<div class="row">
					<UiButton variant="primary" @click="click('primary')">Primary</UiButton>
					<UiButton variant="default" @click="click('default')">Default</UiButton>
					<UiButton variant="danger" @click="click('danger')">Danger</UiButton>
				</div>
				<div class="row">
					<UiButton size="sm">Small</UiButton>
					<UiButton size="md">Medium</UiButton>
					<UiButton size="lg">Large</UiButton>
				</div>
				<div class="row">
					<UiButton disabled>Disabled</UiButton>
				</div>
			</section>
		</div>
	</ThemeProvider>
</template>

<style scoped>
.page {
	max-width: 720px;
	margin: 0 auto;
	padding: 32px;
	font-family: var(--ui-font-sans);
	color: var(--ui-color-text);
	background: var(--ui-color-surface);
	min-height: 100vh;
}

.row {
	display: flex;
	gap: 12px;
	margin: 8px 0;
}
</style>
