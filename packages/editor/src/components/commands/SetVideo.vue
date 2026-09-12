<template>
	<WindowFrame id="setVideo"
				:ref="registryRef(fieldEls, 'setVideo')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setVideo.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Element</div>
			<CustomBox id="setVideo-element" v-focus type="element" v-model="form.element" />
			<div class="text">Properties</div>
			<ParamList id="setVideo-properties"
				:ref="registryRef(fieldEls, 'setVideo-properties')" v-focus v-model="form.properties" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { createElementRegistry, registryRef } from '@app/utils/element-registry';

// P5b 批次 4：本组件的控件元素注册表（替代按 id 查 DOM）
const fieldEls = createElementRegistry();
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSetVideoCommandSchema } from '@app/composables/commands/useSetVideoCommandSchema';
import { clear } from '@app/utils/element-utils';
import { VideoProperty } from '@app/commands/property-window/set-video-property-window.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import ParamList from '@app/components/common/ParamList.vue';

const { t } = useI18n();

const { form, save } = useSetVideoCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	fieldEls.get('setVideo-properties')?.bind?.(VideoProperty);
	fieldEls.get('setVideo')?.on?.('closed', () => {
		clear(fieldEls.get('setVideo-properties'));
	});
});
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
#setVideo {
	width: 324px;
	height: 204px;
}

#setVideo-properties {
	height: 102px;
}

#setVideo-confirm {
	right: 108px;
	bottom: 10px;
}

#setVideo-cancel {
	right: 10px;
	bottom: 10px;
}

</style>
