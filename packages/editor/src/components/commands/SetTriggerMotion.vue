<template>
	<WindowFrame id="setTriggerMotion" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setTriggerMotion.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.setTriggerMotion-trigger.label') }}</div>
			<CustomBox
				id="setTriggerMotion-trigger"
				v-tip="t('components.setTriggerMotion-trigger.tip')"
				v-focus
				type="trigger"
				v-model="form.trigger"
			/>
			<div class="text">{{ t('components.setTriggerMotion-motion.label') }}</div>
			<CustomBox
				id="setTriggerMotion-motion"
				v-tip="t('components.setTriggerMotion-motion.tip')"
				type="enum-string"
				v-model="form.motion"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useSetTriggerMotionCommandSchema } from '@app/composables/commands/useSetTriggerMotionCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';

const { t } = useI18n();

const { form, save } = useSetTriggerMotionCommandSchema();

const onConfirm = () => {
	save();
};
</script>

<style>
/* 不能用 scoped：-confirm/-cancel 等元素由 WindowFrame 内部生成 */
#setTriggerMotion {
	width: 324px;
	height: 122px;
}

#setTriggerMotion-confirm {
	right: 108px;
	bottom: 10px;
}

#setTriggerMotion-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
