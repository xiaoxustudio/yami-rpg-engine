<template>
	<WindowFrame id="wait" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.wait.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.wait-duration.label') }}</div>
			<NumberVar id="wait-duration"
				v-tip="t('components.wait-duration.tip')" v-focus min="1" max="3600000" unit="ms" v-model="form.duration" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useWaitCommandSchema } from '@app/composables/commands/useWaitCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import NumberVar from '@app/components/common/NumberVar.vue';

const { t } = useI18n();

const { form, save } = useWaitCommandSchema();

const onConfirm = () => {
	save();
};
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
#wait {
	width: 324px;
	height: 98px;
}

#wait-confirm {
	right: 108px;
	bottom: 10px;
}

#wait-cancel {
	right: 10px;
	bottom: 10px;
}

</style>
