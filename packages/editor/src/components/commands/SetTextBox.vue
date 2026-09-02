<template>
	<WindowFrame id="setTextBox" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setTextBox.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Element</div>
			<CustomBox id="setTextBox-element" v-focus type="element" v-model="form.element" />
			<div class="text">Properties</div>
			<ParamList id="setTextBox-properties" v-focus v-model="form.properties" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSetTextBoxCommandSchema } from '@app/composables/commands/useSetTextBoxCommandSchema';
import { $ } from '@app/utils/dom';
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
	$('#setTextBox-properties')?.bind?.(TextBoxProperty);
	$('#setTextBox')?.on?.('closed', () => {
		clear($('#setTextBox-properties'));
	});
});
</script>
