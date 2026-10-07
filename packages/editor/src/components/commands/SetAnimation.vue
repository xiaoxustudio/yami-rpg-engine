<template>
	<WindowFrame
		id="setAnimation"
		:ref="registryRef(fieldEls, 'setAnimation')"
		@confirm="onConfirm"
	>
		<template #title
			><TitleBar
				>{{ t('components.setAnimation.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.setAnimation-element.label') }}</div>
			<CustomBox
				id="setAnimation-element"
				:ref="registryRef(fieldEls, 'setAnimation-element')"
				v-tip="t('components.setAnimation-element.tip')"
				v-focus
				type="element"
				v-model="form.element"
			/>
			<div class="text">{{ t('components.setAnimation-properties.label') }}</div>
			<ParamList
				id="setAnimation-properties"
				:ref="registryRef(fieldEls, 'setAnimation-properties')"
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
import { useSetAnimationCommandSchema } from '@app/composables/commands/useSetAnimationCommandSchema';
import { clear } from '@app/utils/element-utils';
import { AnimationProperty } from '@app/commands/property-window/set-animation-property-window.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import ParamList from '@app/components/common/ParamList.vue';

const { t } = useI18n();

const { form, save } = useSetAnimationCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	fieldEls.get('setAnimation-properties')?.bind?.(AnimationProperty);
	fieldEls.get('setAnimation')?.on?.('closed', () => {
		clear(fieldEls.get('setAnimation-properties'));
	});
});
</script>

<style>
#setAnimation {
	width: 324px;
	height: 204px;
}

#setAnimation-properties {
	height: 102px;
}

#setAnimation-confirm {
	right: 108px;
	bottom: 10px;
}

#setAnimation-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
