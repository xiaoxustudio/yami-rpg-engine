<template>
	<WindowFrame id="setWindow" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setWindow.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Element</div>
			<CustomBox id="setWindow-element" v-focus type="element" v-model="form.element" />
			<div class="text">Properties</div>
			<ParamList id="setWindow-properties" v-focus v-model="form.properties" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSetWindowCommandSchema } from '@app/composables/commands/useSetWindowCommandSchema';
import { $ } from '@app/utils/dom';
import { clear } from '@app/utils/element-utils';
import { WindowProperty } from '@app/commands/property-window/set-window-property-window.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import ParamList from '@app/components/common/ParamList.vue';

const { t } = useI18n();

const { form, save } = useSetWindowCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	$('#setWindow-properties')?.bind?.(WindowProperty);
	$('#setWindow')?.on?.('closed', () => {
		clear($('#setWindow-properties'));
	});
});
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
#setWindow {
	width: 324px;
	height: 204px;
}

#setWindow-properties {
	height: 102px;
}

#setWindow-confirm {
	right: 108px;
	bottom: 10px;
}

#setWindow-cancel {
	right: 10px;
	bottom: 10px;
}

</style>
