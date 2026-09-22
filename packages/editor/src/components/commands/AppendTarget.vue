<template>
	<WindowFrame id="appendTarget" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.appendTarget.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.appendTarget-actor.label') }}</div>
			<CustomBox
				id="appendTarget-actor"
				v-tip="t('components.appendTarget-actor.tip')"
				v-focus
				type="actor"
				v-model="form.actor"
			/>
			<div class="text">{{ t('components.appendTarget-target.label') }}</div>
			<CustomBox
				id="appendTarget-target"
				v-tip="t('components.appendTarget-target.tip')"
				type="actor"
				v-model="form.target"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useAppendTargetCommandSchema } from '@app/composables/commands/useAppendTargetCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';

const { t } = useI18n();

const { form, save } = useAppendTargetCommandSchema();

const onConfirm = () => {
	save();
};
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
#appendTarget {
	width: 324px;
	height: 122px;
}

#appendTarget-confirm {
	right: 108px;
	bottom: 10px;
}

#appendTarget-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
