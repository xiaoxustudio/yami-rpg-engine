<template>
	<WindowFrame id="controlButton" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.controlButton.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.controlButton-operation.label') }}</div>
			<SelectBox id="controlButton-operation"
				v-tip="t('components.controlButton-operation.tip')"
				:ref="registryRef(fieldEls, 'controlButton-operation')" v-focus v-model="form.operation" />
			<div class="text">{{ t('components.controlButton-element.label') }}</div>
			<CustomBox id="controlButton-element"
				v-tip="t('components.controlButton-element.tip')"
				:ref="registryRef(fieldEls, 'controlButton-element')" type="element" v-model="form.element" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { createElementRegistry, registryRef } from '@app/utils/element-registry';

// P5b 批次 4：本组件的控件元素注册表（替代按 id 查 DOM）
const fieldEls = createElementRegistry();
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useControlButtonCommandSchema } from '@app/composables/commands/useControlButtonCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useControlButtonCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	fieldEls.get('controlButton-operation')?.loadItems?.([
		{
			name: t('command.controlButton.select-default') || 'Select Default Button',
			value: 'select-default'
		},
		{ name: t('command.controlButton.select') || 'Select Button', value: 'select' },
		{ name: t('command.controlButton.hover-mode') || 'Display Hover Mode', value: 'hover-mode' },
		{
			name: t('command.controlButton.active-mode') || 'Display Active Mode',
			value: 'active-mode'
		},
		{
			name: t('command.controlButton.normal-mode') || 'Restore Display Mode',
			value: 'normal-mode'
		}
	]);
	fieldEls.get('controlButton-operation')
		?.enableHiddenMode?.()
		?.relate?.([
			{
				case: ['select', 'hover-mode', 'active-mode', 'normal-mode'],
				targets: [fieldEls.get('controlButton-element')]
			}
		]);
});
</script>

<style>
/* 窗口尺寸样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
#controlButton {
	width: 324px;
	height: 122px;
}

#controlButton-confirm {
	right: 108px;
	bottom: 10px;
}

#controlButton-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
