<template>
	<WindowFrame id="setTextBox"
				:ref="registryRef(fieldEls, 'setTextBox')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setTextBox.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Element</div>
			<CustomBox id="setTextBox-element" v-focus type="element" v-model="form.element" />
			<div class="text">Properties</div>
			<ParamList id="setTextBox-properties"
				:ref="registryRef(fieldEls, 'setTextBox-properties')" v-focus v-model="form.properties" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { createElementRegistry, registryRef } from '@app/utils/element-registry';

// P5b 批次 4：本组件的控件元素注册表（替代按 id 查 DOM）
const fieldEls = createElementRegistry();
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSetTextBoxCommandSchema } from '@app/composables/commands/useSetTextBoxCommandSchema';
import { clear } from '@app/utils/element-utils';
import { TextBoxProperty } from '@app/commands/property-window/set-textbox-property-window.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import ParamList from '@app/components/common/ParamList.vue';

const { t } = useI18n();

const { form, save } = useSetTextBoxCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	fieldEls.get('setTextBox-properties')?.bind?.(TextBoxProperty);
	fieldEls.get('setTextBox')?.on?.('closed', () => {
		clear(fieldEls.get('setTextBox-properties'));
	});
});
</script>

<style>
/* 窗口尺寸样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
#setTextBox {
	width: 324px;
	height: 204px;
}

#setTextBox-properties {
	height: 102px;
}

#setTextBox-confirm {
	right: 108px;
	bottom: 10px;
}

#setTextBox-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
