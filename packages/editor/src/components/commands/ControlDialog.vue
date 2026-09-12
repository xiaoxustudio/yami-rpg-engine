<template>
	<WindowFrame id="controlDialog" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.controlDialog.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Element</div>
			<CustomBox id="controlDialog-element"
				v-tip="t('components.controlDialog-element.tip')" v-focus type="element" v-model="form.element" />
			<div class="text">Operation</div>
			<SelectBox id="controlDialog-operation"
				v-tip="t('components.controlDialog-operation.tip')"
				:ref="registryRef(fieldEls, 'controlDialog-operation')" v-model="form.operation" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { createElementRegistry, registryRef } from '@app/utils/element-registry';

// P5b 批次 4：本组件的控件元素注册表（替代按 id 查 DOM）
const fieldEls = createElementRegistry();
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useControlDialogCommandSchema } from '@app/composables/commands/useControlDialogCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useControlDialogCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	fieldEls.get('controlDialog-operation')?.loadItems?.([
		{ name: t('command.controlDialog.pause') || 'Pause Printing', value: 'pause' },
		{ name: t('command.controlDialog.continue') || 'Continue Printing', value: 'continue' },
		{
			name: t('command.controlDialog.print-immediately') || 'Print Immediately',
			value: 'print-immediately'
		},
		{
			name: t('command.controlDialog.print-next-page') || 'Print Next Page',
			value: 'print-next-page'
		}
	]);
});
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
#controlDialog {
	width: 324px;
	height: 122px;
}

#controlDialog-confirm {
	right: 108px;
	bottom: 10px;
}

#controlDialog-cancel {
	right: 10px;
	bottom: 10px;
}

</style>
