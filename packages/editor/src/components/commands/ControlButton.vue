<template>
	<WindowFrame
		id="controlButton"
		:ref="registryRef(fieldEls, 'controlButton')"
		@confirm="onConfirm"
	>
		<template #title
			><TitleBar
				>{{ t('components.controlButton.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.controlButton-operation.label') }}</div>
			<SelectBox
				:label="t('components.controlButton-operation.label')"
				id="controlButton-operation"
				v-tip="t('components.controlButton-operation.tip')"
				:ref="registryRef(fieldEls, 'controlButton-operation')"
				v-focus
				v-model="form.operation"
			/>
			<div class="text">{{ t('components.controlButton-element.label') }}</div>
			<CustomBox
				id="controlButton-element"
				v-tip="t('components.controlButton-element.tip')"
				:ref="registryRef(fieldEls, 'controlButton-element')"
				type="element"
				v-model="form.element"
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
	useLocalizedOptions(
		'controlButton-operation',
		['select-default', 'select', 'hover-mode', 'active-mode', 'normal-mode'],
		(items) => fieldEls.get('controlButton-operation')?.loadItems?.(items),
		{
			'select-default': 'command.controlButton.select-default',
			select: 'command.controlButton.select',
			'hover-mode': 'command.controlButton.hover-mode',
			'active-mode': 'command.controlButton.active-mode',
			'normal-mode': 'command.controlButton.normal-mode'
		}
	);
	fieldEls
		.get('controlButton-operation')
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
/* 不能用 scoped：-confirm/-cancel 等元素由 WindowFrame 内部生成 */
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
