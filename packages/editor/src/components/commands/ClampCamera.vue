<template>
	<WindowFrame id="clampCamera" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.clampCamera.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Left</div>
			<NumberVar
				id="clampCamera-left"
				v-focus
				min="-1000"
				max="1000"
				step="0.1"
				decimals="4"
				v-model="form.left"
			/>
			<div class="text">Top</div>
			<NumberVar
				id="clampCamera-top"
				min="-1000"
				max="1000"
				step="0.1"
				decimals="4"
				v-model="form.top"
			/>
			<div class="text">Right</div>
			<NumberVar
				id="clampCamera-right"
				min="-1000"
				max="1000"
				step="0.1"
				decimals="4"
				v-model="form.right"
			/>
			<div class="text">Bottom</div>
			<NumberVar
				id="clampCamera-bottom"
				min="-1000"
				max="1000"
				step="0.1"
				decimals="4"
				v-model="form.bottom"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useClampCameraCommandSchema } from '@app/composables/commands/useClampCameraCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import NumberVar from '@app/components/common/NumberVar.vue';

const { t } = useI18n();

const { form, save } = useClampCameraCommandSchema();

const onConfirm = () => {
	save();
};
</script>
