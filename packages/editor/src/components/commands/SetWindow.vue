<template>
	<WindowFrame id="setWindow" @confirm="onConfirm">
		<template #title><TitleBar>{{ t('components.setWindow.title') }}<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Element</div><CustomBox id="setWindow-element" type="element" @input="onElement" />
				<div class="text">Properties</div><ParamList id="setWindow-properties" />
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">

import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSetWindowCommandSchema } from '@app/composables/commands/useSetWindowCommandSchema';
import { $ } from '@app/utils/dom';
import { clear } from '@app/utils/element-utils';
import { WindowProperty } from '@app/legacy/command/set-window-property-window.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import ParamList from '@app/components/common/ParamList.vue';

const { t } = useI18n();

const { form, save } = useSetWindowCommandSchema();

const onElement = (value: unknown) => {
	form.element = value;
};

const onConfirm = () => {
	save();
};

onMounted(() => {
	$('#setWindow-properties')?.bind?.(WindowProperty);
	$('#setWindow')?.on?.('closed', () => {
		clear($('#setWindow-properties'));
	});
});

</script>
