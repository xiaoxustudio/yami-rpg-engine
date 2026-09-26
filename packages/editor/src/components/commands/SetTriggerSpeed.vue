<template>
	<WindowFrame id="setTriggerSpeed" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setTriggerSpeed.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.setTriggerSpeed-trigger.label') }}</div>
			<CustomBox
				id="setTriggerSpeed-trigger"
				v-tip="t('components.setTriggerSpeed-trigger.tip')"
				v-focus
				type="trigger"
				v-model="form.trigger"
			/>
			<div class="text">{{ t('components.setTriggerSpeed-speed.label') }}</div>
			<NumberVar
				id="setTriggerSpeed-speed"
				v-tip="t('components.setTriggerSpeed-speed.tip')"
				min="0"
				max="512"
				decimals="4"
				unit="t/s"
				v-model="form.speed"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useSetTriggerSpeedCommandSchema } from '@app/composables/commands/useSetTriggerSpeedCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';

const { t } = useI18n();

const { form, save } = useSetTriggerSpeedCommandSchema();

const onConfirm = () => {
	save();
};
</script>

<style>
/* 不能用 scoped：-confirm/-cancel 等元素由 WindowFrame 内部生成 */
#setTriggerSpeed {
	width: 324px;
	height: 122px;
}

#setTriggerSpeed-confirm {
	right: 108px;
	bottom: 10px;
}

#setTriggerSpeed-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
