<template>
	<WindowFrame id="setVideo" :ref="registryRef(fieldEls, 'setVideo')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setVideo.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.setVideo-element.label') }}</div>
			<CustomBox
				id="setVideo-element"
				:ref="registryRef(fieldEls, 'setVideo-element')"
				v-tip="t('components.setVideo-element.tip')"
				v-focus
				type="element"
				v-model="form.element"
			/>
			<div class="text">{{ t('components.setVideo-properties.label') }}</div>
			<ParamList
				id="setVideo-properties"
				:ref="registryRef(fieldEls, 'setVideo-properties')"
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
