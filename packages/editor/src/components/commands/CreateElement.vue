<template>
	<WindowFrame id="createElement" :ref="controlRef('createElement')" @confirm="onConfirm">
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
				:ref="controlRef('createElement-operation')"
				v-focus
				v-model="form.operation"
			/>
			<div class="text">{{ t('components.createElement-parent.label') }}</div>
			<CustomBox
				id="createElement-parent"
				v-tip="t('components.createElement-parent.tip')"
				:ref="controlRef('createElement-parent')"
				type="element"
				v-model="form.parent"
			/>
			<div class="text">{{ t('components.createElement-uiId.label') }}</div>
			<CustomBox
				id="createElement-uiId"
				v-tip="t('components.createElement-uiId.tip')"
				:ref="controlRef('createElement-uiId')"
				v-focus
				type="file"
				filter="ui"
				v-model="form.uiId"
			/>
			<div class="text">{{ t('components.createElement-presetId.label') }}</div>
			<CustomBox
				id="createElement-presetId"
				v-tip="t('components.createElement-presetId.tip')"
				:ref="controlRef('createElement-presetId')"
				v-focus
				type="preset-element"
				v-model="form.presetId"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useLocalizedOptions } from '@app/composables/useLocalizedOptions';

import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useCreateElementCommandSchema } from '@app/composables/commands/useCreateElementCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import { controlRoot, useControlRefs } from '@app/composables/control-refs';

/** 控件 id 联合：模板与脚本共用，拼错在 tsc / vue-tsc 就红。 */
type Id =
	| 'createElement'
	| 'createElement-operation'
	| 'createElement-parent'
	| 'createElement-presetId'
	| 'createElement-uiId';

const { controls, controlRef } = useControlRefs<Id>();

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
		(items) => controls['createElement-operation']?.loadItems?.(items)
	);
	controls['createElement-operation']?.enableHiddenMode?.();
	controls['createElement-operation']?.relate?.([
		{
			case: 'append-all-to-root',
			targets: [controlRoot(controls['createElement-uiId'])]
		},
		{
			case: 'append-one-to-root',
			targets: [controlRoot(controls['createElement-presetId'])]
		},
		{
			case: 'append-all-to-element',
			targets: [
				controlRoot(controls['createElement-parent']),
				controlRoot(controls['createElement-uiId'])
			]
		},
		{
			case: 'append-one-to-element',
			targets: [
				controlRoot(controls['createElement-parent']),
				controlRoot(controls['createElement-presetId'])
			]
		}
	]);
});
</script>

<style>
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
