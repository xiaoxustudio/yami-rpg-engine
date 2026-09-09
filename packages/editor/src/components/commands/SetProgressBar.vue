<template>
	<WindowFrame id="setProgressBar" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setProgressBar.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Element</div>
			<CustomBox id="setProgressBar-element" v-focus type="element" v-model="form.element" />
			<div class="text">Properties</div>
			<ParamList id="setProgressBar-properties" v-focus v-model="form.properties" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSetProgressBarCommandSchema } from '@app/composables/commands/useSetProgressBarCommandSchema';
import { $ } from '@app/utils/dom';
import { clear } from '@app/utils/element-utils';
import { ProgressBarProperty } from '@app/commands/property-window/set-progress-property-window.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import ParamList from '@app/components/common/ParamList.vue';

const { t } = useI18n();

const { form, save } = useSetProgressBarCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	$('#setProgressBar-properties')?.bind?.(ProgressBarProperty);
	$('#setProgressBar')?.on?.('closed', () => {
		clear($('#setProgressBar-properties'));
	});
});
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
#setProgressBar {
	width: 324px;
	height: 204px;
}

#setProgressBar-properties {
	height: 102px;
}

#setProgressBar-confirm {
	right: 108px;
	bottom: 10px;
}

#setProgressBar-cancel {
	right: 10px;
	bottom: 10px;
}

</style>
