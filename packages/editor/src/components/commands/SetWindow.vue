<template>
	<WindowFrame id="setWindow"
				:ref="registryRef(fieldEls, 'setWindow')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setWindow.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.setWindow-element.label') }}</div>
			<CustomBox id="setWindow-element"
				:ref="registryRef(fieldEls, 'setWindow-element')"
				v-tip="t('components.setWindow-element.tip')" v-focus type="element" v-model="form.element" />
			<div class="text">{{ t('components.setWindow-properties.label') }}</div>
			<ParamList id="setWindow-properties"
				:ref="registryRef(fieldEls, 'setWindow-properties')" v-focus v-model="form.properties" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { createElementRegistry, registryRef } from '@app/utils/element-registry';
import { composableEls } from '@app/composables/element-registry';

// P5b 批次 4：本组件的控件元素注册表（替代按 id 查 DOM）
const fieldEls = createElementRegistry(composableEls);
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSetWindowCommandSchema } from '@app/composables/commands/useSetWindowCommandSchema';
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
	fieldEls.get('setWindow-properties')?.bind?.(WindowProperty);
	fieldEls.get('setWindow')?.on?.('closed', () => {
		clear(fieldEls.get('setWindow-properties'));
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
