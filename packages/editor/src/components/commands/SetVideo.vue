<template>
	<WindowFrame
		id="setVideo"
		:ref="controlRef('setVideo')"
		@confirm="onConfirm"
		@closed="onClosed"
	>
		<template #title
			><TitleBar
				>{{ t('components.setVideo.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.setVideo-element.label') }}</div>
			<CustomBox
				id="setVideo-element"
				:ref="controlRef('setVideo-element')"
				v-tip="t('components.setVideo-element.tip')"
				v-focus
				type="element"
				v-model="form.element"
			/>
			<div class="text">{{ t('components.setVideo-properties.label') }}</div>
			<ParamList
				id="setVideo-properties"
				:ref="controlRef('setVideo-properties')"
				v-focus
				v-model="form.properties"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { controlRoot, useControlRefs } from '@app/composables/control-refs';
import { useSetVideoCommandSchema } from '@app/composables/commands/useSetVideoCommandSchema';
import { clear } from '@app/utils/element-utils';
import { VideoProperty } from '@app/commands/property-window/set-video-property-window.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import ParamList from '@app/components/common/ParamList.vue';

/** 控件 id 联合：模板与脚本共用，拼错在 tsc / vue-tsc 就红。 */
type Id = 'setVideo' | 'setVideo-element' | 'setVideo-properties';

const { controls, controlRef } = useControlRefs<Id>();

const { t } = useI18n();

const { form, save } = useSetVideoCommandSchema();

const onConfirm = () => {
	save();
};

/** 窗口关闭时清理。 */
const onClosed = () => {
	clear(controlRoot(controls['setVideo-properties']));
};

onMounted(() => {
	controls['setVideo-properties']?.bind?.(VideoProperty);
});
</script>

<style>
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
