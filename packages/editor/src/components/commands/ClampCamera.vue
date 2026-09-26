<template>
	<WindowFrame id="clampCamera" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.clampCamera.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.clampCamera-left.label') }}</div>
			<NumberVar
				id="clampCamera-left"
				v-tip="t('components.clampCamera-left.tip')"
				v-focus
				min="-1000"
				max="1000"
				step="0.1"
				decimals="4"
				v-model="form.left"
			/>
			<div class="text">{{ t('components.clampCamera-top.label') }}</div>
			<NumberVar
				id="clampCamera-top"
				v-tip="t('components.clampCamera-top.tip')"
				min="-1000"
				max="1000"
				step="0.1"
				decimals="4"
				v-model="form.top"
			/>
			<div class="text">{{ t('components.clampCamera-right.label') }}</div>
			<NumberVar
				id="clampCamera-right"
				v-tip="t('components.clampCamera-right.tip')"
				min="-1000"
				max="1000"
				step="0.1"
				decimals="4"
				v-model="form.right"
			/>
			<div class="text">{{ t('components.clampCamera-bottom.label') }}</div>
			<NumberVar
				id="clampCamera-bottom"
				v-tip="t('components.clampCamera-bottom.tip')"
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

<style>
/* 不能用 scoped：-confirm/-cancel 等元素由 WindowFrame 内部生成 */
#clampCamera {
	width: 324px;
	height: 170px;
}

#clampCamera-confirm {
	right: 108px;
	bottom: 10px;
}

#clampCamera-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
