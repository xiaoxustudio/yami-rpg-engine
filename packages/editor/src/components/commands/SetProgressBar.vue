<template>
	<WindowFrame
		id="setProgressBar"
		:ref="registryRef(fieldEls, 'setProgressBar')"
		@confirm="onConfirm"
		@closed="onClosed"
	>
		<template #title
			><TitleBar
				>{{ t('components.setProgressBar.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.setProgressBar-element.label') }}</div>
			<CustomBox
				id="setProgressBar-element"
				:ref="registryRef(fieldEls, 'setProgressBar-element')"
				v-tip="t('components.setProgressBar-element.tip')"
				v-focus
				type="element"
				v-model="form.element"
			/>
			<div class="text">{{ t('components.setProgressBar-properties.label') }}</div>
			<ParamList
				id="setProgressBar-properties"
				:ref="registryRef(fieldEls, 'setProgressBar-properties')"
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
import { useSetProgressBarCommandSchema } from '@app/composables/commands/useSetProgressBarCommandSchema';
import { clear } from '@app/utils/element-utils';
import { ProgressBarProperty } from '@app/commands/property-window/set-progress-property-window.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import ParamList from '@app/components/common/ParamList.vue';

const { t } = useI18n();

const { form, save } = useSetProgressBarCommandSchema();

const onConfirm = () => {
	save();
};

/** 窗口关闭时清理。 */
const onClosed = () => {
	clear(fieldEls.get('setProgressBar-properties'));
};

onMounted(() => {
	fieldEls.get('setProgressBar-properties')?.bind?.(ProgressBarProperty);
});
</script>

<style>
#setProgressBar {
	width: 324px;
	height: 204px;
}

#setProgressBar-properties {
	height: 102px;
}

#setProgressBar-confirm {
	right: 108px;
	bottom: 10px;
}

#setProgressBar-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
