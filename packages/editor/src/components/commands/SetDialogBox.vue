<template>
	<WindowFrame id="setDialogBox" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setDialogBox.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Element</div>
			<CustomBox id="setDialogBox-element" v-focus type="element" v-model="form.element" />
			<div class="text">Properties</div>
			<ParamList id="setDialogBox-properties" v-focus v-model="form.properties" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSetDialogBoxCommandSchema } from '@app/composables/commands/useSetDialogBoxCommandSchema';
import { $ } from '@app/utils/dom';
import { clear } from '@app/utils/element-utils';
import { DialogBoxProperty } from '@app/commands/property-window/set-dialog-property-window.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import ParamList from '@app/components/common/ParamList.vue';

const { t } = useI18n();

const { form, save } = useSetDialogBoxCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	$('#setDialogBox-properties')?.bind?.(DialogBoxProperty);
	$('#setDialogBox')?.on?.('closed', () => {
		clear($('#setDialogBox-properties'));
	});
});
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
#setDialogBox {
	width: 324px;
	height: 204px;
}

#setDialogBox-properties {
	height: 102px;
}

#setDialogBox-confirm {
	right: 108px;
	bottom: 10px;
}

#setDialogBox-cancel {
	right: 10px;
	bottom: 10px;
}

</style>
