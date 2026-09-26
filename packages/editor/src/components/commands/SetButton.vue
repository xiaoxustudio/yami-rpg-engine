<template>
	<WindowFrame id="setButton" :ref="registryRef(fieldEls, 'setButton')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setButton.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.setButton-element.label') }}</div>
			<CustomBox
				id="setButton-element"
				:ref="registryRef(fieldEls, 'setButton-element')"
				v-tip="t('components.setButton-element.tip')"
				v-focus
				type="element"
				v-model="form.element"
			/>
			<div class="text">{{ t('components.setButton-properties.label') }}</div>
			<ParamList
				id="setButton-properties"
				:ref="registryRef(fieldEls, 'setButton-properties')"
				v-focus
				v-model="form.properties"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { createElementRegistry, registryRef } from '@app/utils/element-registry';
import { composableEls } from '@app/composables/element-registry';

// 本组件的控件元素注册表（替代按 id 查 DOM）
const fieldEls = createElementRegistry(composableEls);
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSetButtonCommandSchema } from '@app/composables/commands/useSetButtonCommandSchema';
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
	fieldEls.get('setButton-properties')?.bind?.(ButtonProperty);
	fieldEls.get('setButton')?.on?.('closed', () => {
		clear(fieldEls.get('setButton-properties'));
	});
});
</script>

<style>
/* 不能用 scoped：-confirm/-cancel 等元素由 WindowFrame 内部生成 */
#setButton {
	width: 324px;
	height: 204px;
}

#setButton-properties {
	height: 102px;
}

#setButton-confirm {
	right: 108px;
	bottom: 10px;
}

#setButton-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
