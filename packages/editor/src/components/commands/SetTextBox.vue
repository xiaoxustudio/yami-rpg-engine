<template>
	<WindowFrame id="setTextBox" :ref="registryRef(fieldEls, 'setTextBox')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setTextBox.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.setTextBox-element.label') }}</div>
			<CustomBox
				id="setTextBox-element"
				:ref="registryRef(fieldEls, 'setTextBox-element')"
				v-tip="t('components.setTextBox-element.tip')"
				v-focus
				type="element"
				v-model="form.element"
			/>
			<div class="text">{{ t('components.setTextBox-properties.label') }}</div>
			<ParamList
				id="setTextBox-properties"
				:ref="registryRef(fieldEls, 'setTextBox-properties')"
				v-focus
				v-model="form.properties"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { createElementRegistry, registryRef } from '@app/utils/element-registry';
import { composableEls } from '@app/composables/element-registry';

const fieldEls = createElementRegistry(composableEls);
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
