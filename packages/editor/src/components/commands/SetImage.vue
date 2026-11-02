<template>
	<WindowFrame
		id="setImage"
		:ref="controlRef('setImage')"
		@confirm="onConfirm"
		@closed="onClosed"
	>
		<template #title
			><TitleBar
				>{{ t('components.setImage.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.setImage-element.label') }}</div>
			<CustomBox
				id="setImage-element"
				:ref="controlRef('setImage-element')"
				v-focus
				type="element"
				v-model="form.element"
			/>
			<div class="text">{{ t('components.setImage-properties.label') }}</div>
			<ParamList
				id="setImage-properties"
				:ref="controlRef('setImage-properties')"
				v-focus
				v-model="form.properties"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSetImageCommandSchema } from '@app/composables/commands/useSetImageCommandSchema';
import { clear } from '@app/utils/element-utils';
import { ImageProperty } from '@app/commands/property-window/set-image-property-window.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import ParamList from '@app/components/common/ParamList.vue';
import { controlRoot, useControlRefs } from '@app/composables/control-refs';

/** 控件 id 联合：模板与脚本共用，拼错在 tsc / vue-tsc 就红。 */
type Id = 'setImage' | 'setImage-element' | 'setImage-properties';

const { controls, controlRef } = useControlRefs<Id>();

const { t } = useI18n();

const { form, save } = useSetImageCommandSchema();

const onConfirm = () => {
	save();
};

/** 窗口关闭时清理。 */
const onClosed = () => {
	clear(controlRoot(controls['setImage-properties']));
};

onMounted(() => {
	controls['setImage-properties']?.bind?.(ImageProperty);
});
</script>

<style>
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
