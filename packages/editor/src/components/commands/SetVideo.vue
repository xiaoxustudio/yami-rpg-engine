<template>
	<WindowFrame id="setVideo" @confirm="onConfirm">
		<template #title><TitleBar>{{ t('components.setVideo.title') }}<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Element</div><CustomBox id="setVideo-element" type="element" @input="onElement" />
				<div class="text">Properties</div><ParamList id="setVideo-properties" />
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">

import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSetVideoCommandSchema } from '@app/composables/commands/useSetVideoCommandSchema';
import { $ } from '@app/utils/dom';
import { clear } from '@app/utils/element-utils';
import { VideoProperty } from '@app/legacy/command/set-video-property-window.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import ParamList from '@app/components/common/ParamList.vue';

const { t } = useI18n();

const { form, save } = useSetVideoCommandSchema();

const onElement = (value: unknown) => {
	form.element = value;
};

const onConfirm = () => {
	save();
};

onMounted(() => {
	$('#setVideo-properties')?.bind?.(VideoProperty);
	$('#setVideo')?.on?.('closed', () => {
		clear($('#setVideo-properties'));
	});
});

</script>
