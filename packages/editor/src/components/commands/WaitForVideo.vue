<template>
	<WindowFrame id="waitForVideo" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.waitForVideo.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.waitForVideo-element.label') }}</div>
			<CustomBox
				id="waitForVideo-element"
				v-tip="t('components.waitForVideo-element.tip')"
				v-focus
				type="element"
				v-model="form.element"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useWaitForVideoCommandSchema } from '@app/composables/commands/useWaitForVideoCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';

const { t } = useI18n();

const { form, save } = useWaitForVideoCommandSchema();

const onConfirm = () => {
	save();
};
</script>

<style>
/* 不能用 scoped：-confirm/-cancel 等元素由 WindowFrame 内部生成 */
#waitForVideo {
	width: 324px;
	height: 98px;
}

#waitForVideo-confirm {
	right: 108px;
	bottom: 10px;
}

#waitForVideo-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
