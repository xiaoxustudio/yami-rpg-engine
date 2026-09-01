<template>
	<WindowFrame id="setImage" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setImage.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Element</div>
			<CustomBox id="setImage-element" v-focus type="element" v-model="form.element" />
			<div class="text">Properties</div>
			<ParamList id="setImage-properties" v-focus v-model="form.properties" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSetImageCommandSchema } from '@app/composables/commands/useSetImageCommandSchema';
import { $ } from '@app/utils/dom';
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
	$('#setImage-properties')?.bind?.(ImageProperty);
	$('#setImage')?.on?.('closed', () => {
		clear($('#setImage-properties'));
	});
});
</script>
