<template>
	<WindowFrame
		id="setTextBox"
		:ref="controlRef('setTextBox')"
		@confirm="onConfirm"
		@closed="onClosed"
	>
		<template #title
			><TitleBar
				>{{ t('components.setTextBox.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.setTextBox-element.label') }}</div>
			<CustomBox
				id="setTextBox-element"
				:ref="controlRef('setTextBox-element')"
				v-tip="t('components.setTextBox-element.tip')"
				v-focus
				type="element"
				v-model="form.element"
			/>
			<div class="text">{{ t('components.setTextBox-properties.label') }}</div>
			<ParamList
				id="setTextBox-properties"
				:ref="controlRef('setTextBox-properties')"
				v-focus
				v-model="form.properties"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSetTextBoxCommandSchema } from '@app/composables/commands/useSetTextBoxCommandSchema';
import { clear } from '@app/utils/element-utils';
import { TextBoxProperty } from '@app/commands/property-window/set-textbox-property-window.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import ParamList from '@app/components/common/ParamList.vue';
import { controlRoot, useControlRefs } from '@app/composables/control-refs';

/** 控件 id 联合：模板与脚本共用，拼错在 tsc / vue-tsc 就红。 */
type Id = 'setTextBox' | 'setTextBox-element' | 'setTextBox-properties';

const { controls, controlRef } = useControlRefs<Id>();

const { t } = useI18n();

const { form, save } = useSetTextBoxCommandSchema();

const onConfirm = () => {
	save();
};

/** 窗口关闭时清理。 */
const onClosed = () => {
	clear(controlRoot(controls['setTextBox-properties']));
};

onMounted(() => {
	controls['setTextBox-properties']?.bind?.(TextBoxProperty);
});
</script>

<style>
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
