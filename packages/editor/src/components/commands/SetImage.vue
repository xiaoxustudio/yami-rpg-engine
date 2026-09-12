<template>
	<WindowFrame id="setImage"
				:ref="registryRef(fieldEls, 'setImage')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setImage.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.setImage-element.label') }}</div>
			<CustomBox id="setImage-element"
				:ref="registryRef(fieldEls, 'setImage-element')" v-focus type="element" v-model="form.element" />
			<div class="text">{{ t('components.setImage-properties.label') }}</div>
			<ParamList id="setImage-properties"
				:ref="registryRef(fieldEls, 'setImage-properties')" v-focus v-model="form.properties" />
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
import { useSetImageCommandSchema } from '@app/composables/commands/useSetImageCommandSchema';
import { clear } from '@app/utils/element-utils';
import { ImageProperty } from '@app/commands/property-window/set-image-property-window.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import ParamList from '@app/components/common/ParamList.vue';

const { t } = useI18n();

const { form, save } = useSetImageCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	fieldEls.get('setImage-properties')?.bind?.(ImageProperty);
	fieldEls.get('setImage')?.on?.('closed', () => {
		clear(fieldEls.get('setImage-properties'));
	});
});
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
#setImage {
	width: 324px;
	height: 204px;
}

#setImage-properties {
	height: 102px;
}

#setImage-confirm {
	right: 108px;
	bottom: 10px;
}

#setImage-cancel {
	right: 10px;
	bottom: 10px;
}

</style>
