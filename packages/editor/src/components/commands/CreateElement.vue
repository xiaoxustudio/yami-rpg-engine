<template>
	<WindowFrame
		id="createElement"
		:ref="registryRef(fieldEls, 'createElement')"
		@confirm="onConfirm"
	>
		<template #title
			><TitleBar
				>{{ t('components.createElement.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.createElement-operation.label') }}</div>
			<SelectBox
				:label="t('components.createElement-operation.label')"
				id="createElement-operation"
				v-tip="t('components.createElement-operation.tip')"
				:ref="registryRef(fieldEls, 'createElement-operation')"
				v-focus
				v-model="form.operation"
			/>
			<div class="text">{{ t('components.createElement-parent.label') }}</div>
			<CustomBox
				id="createElement-parent"
				v-tip="t('components.createElement-parent.tip')"
				:ref="registryRef(fieldEls, 'createElement-parent')"
				type="element"
				v-model="form.parent"
			/>
			<div class="text">{{ t('components.createElement-uiId.label') }}</div>
			<CustomBox
				id="createElement-uiId"
				v-tip="t('components.createElement-uiId.tip')"
				:ref="registryRef(fieldEls, 'createElement-uiId')"
				v-focus
				type="file"
				filter="ui"
				v-model="form.uiId"
			/>
			<div class="text">{{ t('components.createElement-presetId.label') }}</div>
			<CustomBox
				id="createElement-presetId"
				v-tip="t('components.createElement-presetId.tip')"
				:ref="registryRef(fieldEls, 'createElement-presetId')"
				v-focus
				type="preset-element"
				v-model="form.presetId"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useLocalizedOptions } from '@app/composables/useLocalizedOptions';
import { createElementRegistry, registryRef } from '@app/utils/element-registry';
import { composableEls } from '@app/composables/element-registry';

// 本组件的控件元素注册表（替代按 id 查 DOM）
const fieldEls = createElementRegistry(composableEls);
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useCreateElementCommandSchema } from '@app/composables/commands/useCreateElementCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useCreateElementCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	useLocalizedOptions(
		'createElement-operation',
		[
			'append-all-to-root',
			'append-one-to-root',
			'append-all-to-element',
			'append-one-to-element'
		],
		(items) => fieldEls.get('createElement-operation')?.loadItems?.(items)
	);
	fieldEls
		.get('createElement-operation')
		?.enableHiddenMode?.()
		?.relate?.([
			{
				case: 'append-all-to-root',
				targets: [fieldEls.get('createElement-uiId')]
			},
			{
				case: 'append-one-to-root',
				targets: [fieldEls.get('createElement-presetId')]
			},
			{
				case: 'append-all-to-element',
				targets: [fieldEls.get('createElement-parent'), fieldEls.get('createElement-uiId')]
			},
			{
				case: 'append-one-to-element',
				targets: [
					fieldEls.get('createElement-parent'),
					fieldEls.get('createElement-presetId')
				]
			}
		]);
});
</script>

<style>
/* 不能用 scoped：-confirm/-cancel 等元素由 WindowFrame 内部生成 */
#createElement {
	width: 324px;
	height: 146px;
}

#createElement-confirm {
	right: 108px;
	bottom: 10px;
}

#createElement-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
