<script setup lang="ts">
import { ref } from 'vue';
import YMButton from '../../src/components/basic/YMButton/YMButton.vue';
import YMCheckBox from '../../src/components/basic/YMCheckBox/YMCheckBox.vue';
import YMSwitchItem from '../../src/components/basic/YMSwitchItem/YMSwitchItem.vue';
import YMEmptyState from '../../src/components/basic/YMEmptyState/YMEmptyState.vue';
import YMLoadingOverlay from '../../src/components/basic/YMLoadingOverlay/YMLoadingOverlay.vue';
import ThemeProvider from '../../src/theme/ThemeProvider.vue';

const click = (msg: string) => () => {
	console.log('[ui-kit playground] click:', msg);
};

const checked = ref(false);
const switchValue = ref(0);
const loadingVisible = ref(false);
</script>

<template>
	<ThemeProvider>
		<div class="page">
			<h1>@yami/ui-kit Playground</h1>
			<section>
				<h2>YMButton</h2>
				<div class="row">
					<YMButton variant="primary" @click="click('primary')">Primary</YMButton>
					<YMButton variant="default" @click="click('default')">Default</YMButton>
					<YMButton variant="danger" @click="click('danger')">Danger</YMButton>
				</div>
				<div class="row">
					<YMButton size="sm">Small</YMButton>
					<YMButton size="md">Medium</YMButton>
					<YMButton size="lg">Large</YMButton>
				</div>
				<div class="row">
					<YMButton disabled>Disabled</YMButton>
				</div>
			</section>
			<section>
				<h2>YMCheckBox</h2>
				<div class="row">
					<YMCheckBox v-model="checked">Normal {{ checked }}</YMCheckBox>
					<YMCheckBox standard>Standard</YMCheckBox>
					<YMCheckBox standard large>Standard Large</YMCheckBox>
					<YMCheckBox disabled>Disabled</YMCheckBox>
				</div>
			</section>
			<section>
				<h2>YMSwitchItem</h2>
				<div class="row">
					<YMSwitchItem v-model="switchValue" :length="4" />
					<span class="hint">value: {{ switchValue }}</span>
				</div>
			</section>
			<section>
				<h2>YMEmptyState</h2>
				<YMEmptyState message="No data found" icon="" />
			</section>
			<section>
				<h2>YMLoadingOverlay</h2>
				<div class="row">
					<YMButton variant="primary" @click="loadingVisible = !loadingVisible">
						Toggle Loading
					</YMButton>
					<YMLoadingOverlay :visible="loadingVisible" text="Loading..." />
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
	font-family: var(--ym-font-sans);
	color: var(--ym-color-text);
	background: var(--ym-color-surface);
	min-height: 100vh;
}

.row {
	display: flex;
	align-items: center;
	gap: 12px;
	margin: 8px 0;
}

.hint {
	color: var(--ym-color-text);
}
</style>
