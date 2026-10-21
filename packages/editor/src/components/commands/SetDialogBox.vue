<template>
	<WindowFrame
		id="setDialogBox"
		:ref="registryRef(fieldEls, 'setDialogBox')"
		@confirm="onConfirm"
		@closed="onClosed"
	>
		<template #title
			><TitleBar
				>{{ t('components.setDialogBox.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.setDialogBox-element.label') }}</div>
			<CustomBox
				id="setDialogBox-element"
				:ref="registryRef(fieldEls, 'setDialogBox-element')"
				v-tip="t('components.setDialogBox-element.tip')"
				v-focus
				type="element"
				v-model="form.element"
			/>
			<div class="text">{{ t('components.setDialogBox-properties.label') }}</div>
			<ParamList
				id="setDialogBox-properties"
				:ref="registryRef(fieldEls, 'setDialogBox-properties')"
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
import { useSetDialogBoxCommandSchema } from '@app/composables/commands/useSetDialogBoxCommandSchema';
import { clear } from '@app/utils/element-utils';
import { DialogBoxProperty } from '@app/commands/property-window/set-dialog-property-window.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import ParamList from '@app/components/common/ParamList.vue';

const { t } = useI18n();

const { form, save } = useSetDialogBoxCommandSchema();

const onConfirm = () => {
	save();
};

/** 窗口关闭时清理。原先是元素优先 API（经 fieldEls 取到元素后订阅 closed）。 */
const onClosed = () => {
	clear(fieldEls.get('setDialogBox-properties'));
};

onMounted(() => {
	fieldEls.get('setDialogBox-properties')?.bind?.(DialogBoxProperty);
});
</script>

<style>
#setDialogBox {
	width: 324px;
	height: 204px;
}

#setDialogBox-properties {
	height: 102px;
}

#setDialogBox-confirm {
	right: 108px;
	bottom: 10px;
}

#setDialogBox-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
