<template>
	<WindowFrame
		id="setPointerEventRoot"
		:ref="controlRef('setPointerEventRoot')"
		@confirm="onConfirm"
	>
		<template #title
			><TitleBar
				>{{ t('components.setPointerEventRoot.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.setPointerEventRoot-operation.label') }}</div>
			<SelectBox
				:label="t('components.setPointerEventRoot-operation.label')"
				id="setPointerEventRoot-operation"
				v-tip="t('components.setPointerEventRoot-operation.tip')"
				:ref="controlRef('setPointerEventRoot-operation')"
				v-focus
				v-model="form.operation"
			/>
			<div class="text">{{ t('components.setPointerEventRoot-element.label') }}</div>
			<CustomBox
				id="setPointerEventRoot-element"
				v-tip="t('components.setPointerEventRoot-element.tip')"
				:ref="controlRef('setPointerEventRoot-element')"
				type="element"
				v-model="form.element"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useLocalizedOptions } from '@app/composables/useLocalizedOptions';

import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSetPointerEventRootCommandSchema } from '@app/composables/commands/useSetPointerEventRootCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import { controlRoot, useControlRefs } from '@app/composables/control-refs';

/** 控件 id 联合：模板与脚本共用，拼错在 tsc / vue-tsc 就红。 */
type Id = 'setPointerEventRoot' | 'setPointerEventRoot-element' | 'setPointerEventRoot-operation';

const { controls, controlRef } = useControlRefs<Id>();

const { t } = useI18n();

const { form, save } = useSetPointerEventRootCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	useLocalizedOptions(
		'setPointerEventRoot-operation',
		['add', 'remove', 'remove-latest', 'reset'],
		(items) => controls['setPointerEventRoot-operation']?.loadItems?.(items)
	);
	controls['setPointerEventRoot-operation']?.enableHiddenMode?.();
	controls['setPointerEventRoot-operation']?.relate?.([
		{
			case: ['add', 'remove'],
			targets: [controlRoot(controls['setPointerEventRoot-element'])]
		}
	]);
});
</script>

<style>
#setPointerEventRoot {
	width: 324px;
	height: 122px;
}

#setPointerEventRoot-confirm {
	right: 108px;
	bottom: 10px;
}

#setPointerEventRoot-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
