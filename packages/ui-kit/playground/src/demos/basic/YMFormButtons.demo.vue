<script setup lang="ts">
import { ref } from 'vue';
import { YMFormButtons, YMButton } from '@ui-kit';
const lastAction = ref('(none)');
const showApply = ref(true);
</script>

<template>
	<section>
		<h2>YMFormButtons</h2>
		<p class="desc">
			表单按钮组；点击后派发 confirm / cancel / apply 冒泡事件，可用 show-apply
			开关第三个按钮。
		</p>
		<div class="row">
			<YMButton size="sm" @click="showApply = !showApply">Toggle Apply</YMButton>
			<span class="hint">last action: {{ lastAction }}</span>
		</div>
		<div
			class="stage"
			@confirm="lastAction = 'confirm'"
			@cancel="lastAction = 'cancel'"
			@apply="lastAction = 'apply'"
		>
			<YMFormButtons
				show-apply
				id-prefix="demo-form"
				confirm-label="Save"
				cancel-label="Cancel"
				apply-label="Apply All"
			/>
		</div>
	</section>
</template>

<style scoped>
.stage {
	position: relative;
	margin-top: var(--ym-space-3);
	width: 320px;
	height: 48px;
	background-color: var(--ym-color-input-bg);
	border: 1px solid var(--ym-color-border);
}
</style>
