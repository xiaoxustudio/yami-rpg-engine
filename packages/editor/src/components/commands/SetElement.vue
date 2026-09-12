<template>
	<WindowFrame id="setElement" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setElement.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.setElement-element.label') }}</div>
			<CustomBox id="setElement-element"
				v-tip="t('components.setElement-element.tip')" v-focus type="element" v-model="form.element" />
			<div class="text">{{ t('components.setElement-operation.label') }}</div>
			<SelectBox id="setElement-operation"
				v-tip="t('components.setElement-operation.tip')"
				:ref="registryRef(fieldEls, 'setElement-operation')" v-model="form.operation" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { createElementRegistry, registryRef } from '@app/utils/element-registry';

// P5b 批次 4：本组件的控件元素注册表（替代按 id 查 DOM）
const fieldEls = createElementRegistry();
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSetElementCommandSchema } from '@app/composables/commands/useSetElementCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useSetElementCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	fieldEls.get('setElement-operation')?.loadItems?.([
		{ name: t('command.setElement.hide') || 'Hide', value: 'hide' },
		{ name: t('command.setElement.show') || 'Show', value: 'show' },
		{
			name: t('command.setElement.disable-pointer-events') || 'Disable Pointer Events',
			value: 'disable-pointer-events'
		},
		{
			name: t('command.setElement.enable-pointer-events') || 'Enable Pointer Events',
			value: 'enable-pointer-events'
		},
		{
			name: t('command.setElement.skip-pointer-events') || 'Skip Pointer Events',
			value: 'skip-pointer-events'
		},
		{
			name: t('command.setElement.move-to-first') || 'Move to First',
			value: 'move-to-first'
		},
		{ name: t('command.setElement.move-to-last') || 'Move to Last', value: 'move-to-last' }
	]);
});
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
#setElement {
	width: 324px;
	height: 122px;
}

#setElement-confirm {
	right: 108px;
	bottom: 10px;
}

#setElement-cancel {
	right: 10px;
	bottom: 10px;
}

</style>
