<template>
	<WindowFrame id="insertImage" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.insertImage.title') }}
				<div class="close"></div></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.insertImage-mode.label') }}</div>
			<SelectBox id="insertImage-mode"
				:ref="registryRef(textCaptureEls, 'insertImage-mode')" v-model="form.mode" />
			<div class="text">{{ t('components.insertImage-image.label') }}</div>
			<CustomBox id="insertImage-image"
				:ref="registryRef(textCaptureEls, 'insertImage-image')" type="file" filter="image" v-model="form.image" />
			<div class="text">{{ t('components.insertImage-clip.label') }}</div>
			<CustomBox
				id="insertImage-clip"
				:ref="registryRef(textCaptureEls, 'insertImage-clip')"
				type="clip"
				image="insertImage-image"
				v-model="form.clip"
			/>
			<div class="text">{{ t('components.insertImage-width.label') }}</div>
			<NumberBox id="insertImage-width"
				:ref="registryRef(textCaptureEls, 'insertImage-width')" min="0" max="10000" v-model="form.width" />
			<div class="text">{{ t('components.insertImage-height.label') }}</div>
			<NumberBox id="insertImage-height"
				:ref="registryRef(textCaptureEls, 'insertImage-height')" min="0" max="10000" v-model="form.height" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { registryRef } from '@app/utils/element-registry';
import { Selection, textCaptureEls } from '@app/tools/text-capture.ts';
import { useTextCaptureWindow } from '@app/composables/useTextCaptureWindow';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const form = useTextCaptureWindow().image.form;

const onConfirm = () => {
	Selection?.image?.confirm?.(new Event('click'));
};
</script>

<style>
/* 窗口样式迁移：由 Project/css/ui.css 迁入组件（选择器为全局 id，不能用 scoped） */
#insertImage {
	width: 324px;
	height: 194px;
}

#insertImage-confirm {
	right: 108px;
	bottom: 10px;
}

#insertImage-cancel {
	right: 10px;
	bottom: 10px;
}
</style>

