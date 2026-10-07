<template>
	<WindowFrame
		id="controlDialog"
		:ref="registryRef(fieldEls, 'controlDialog')"
		@confirm="onConfirm"
	>
		<template #title
			><TitleBar
				>{{ t('components.controlDialog.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.controlDialog-element.label') }}</div>
			<CustomBox
				id="controlDialog-element"
				:ref="registryRef(fieldEls, 'controlDialog-element')"
				v-tip="t('components.controlDialog-element.tip')"
				v-focus
				type="element"
				v-model="form.element"
			/>
			<div class="text">{{ t('components.controlDialog-operation.label') }}</div>
			<SelectBox
				:label="t('components.controlDialog-operation.label')"
				id="controlDialog-operation"
				v-tip="t('components.controlDialog-operation.tip')"
				:ref="registryRef(fieldEls, 'controlDialog-operation')"
				v-model="form.operation"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useLocalizedOptions } from '@app/composables/useLocalizedOptions';
import { createElementRegistry, registryRef } from '@app/utils/element-registry';
import { composableEls } from '@app/composables/element-registry';

const fieldEls = createElementRegistry(composableEls);
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
	useLocalizedOptions(
		'controlDialog-operation',
		['pause', 'continue', 'print-immediately', 'print-next-page'],
		(items) => fieldEls.get('controlDialog-operation')?.loadItems?.(items),
		{
			pause: 'command.controlDialog.pause',
			continue: 'command.controlDialog.continue',
			'print-immediately': 'command.controlDialog.print-immediately',
			'print-next-page': 'command.controlDialog.print-next-page'
		}
	);
});
</script>

<style>
/* 不能用 scoped：-confirm/-cancel 等元素由 WindowFrame 内部生成 */
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
