<template>
	<WindowFrame id="setButton" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setButton.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Element</div>
			<CustomBox id="setButton-element" v-focus type="element" v-model="form.element" />
			<div class="text">Properties</div>
			<ParamList id="setButton-properties" v-focus v-model="form.properties" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSetButtonCommandSchema } from '@app/composables/commands/useSetButtonCommandSchema';
import { $ } from '@app/utils/dom';
import { clear } from '@app/utils/element-utils';
import { ButtonProperty } from '@app/commands/property-window/set-button-property-window.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import ParamList from '@app/components/common/ParamList.vue';

const { t } = useI18n();

const { form, save } = useSetButtonCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	$('#setButton-properties')?.bind?.(ButtonProperty);
	$('#setButton')?.on?.('closed', () => {
		clear($('#setButton-properties'));
	});
});
</script>
