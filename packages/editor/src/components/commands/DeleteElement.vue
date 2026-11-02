<template>
	<WindowFrame id="deleteElement" :ref="controlRef('deleteElement')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.deleteElement.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.deleteElement-operation.label') }}</div>
			<SelectBox
				:label="t('components.deleteElement-operation.label')"
				id="deleteElement-operation"
				v-tip="t('components.deleteElement-operation.tip')"
				:ref="controlRef('deleteElement-operation')"
				v-focus
				v-model="form.operation"
			/>
			<div class="text">{{ t('components.deleteElement-element.label') }}</div>
			<CustomBox
				id="deleteElement-element"
				v-tip="t('components.deleteElement-element.tip')"
				:ref="controlRef('deleteElement-element')"
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
import { useDeleteElementCommandSchema } from '@app/composables/commands/useDeleteElementCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import { controlRoot, useControlRefs } from '@app/composables/control-refs';

/** 控件 id 联合：模板与脚本共用，拼错在 tsc / vue-tsc 就红。 */
type Id = 'deleteElement' | 'deleteElement-element' | 'deleteElement-operation';

const { controls, controlRef } = useControlRefs<Id>();

const { t } = useI18n();

const { form, save } = useDeleteElementCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	useLocalizedOptions(
		'deleteElement-operation',
		['delete-element', 'delete-children', 'delete-all'],
		(items) => controls['deleteElement-operation']?.loadItems?.(items),
		{
			'delete-element': 'command.deleteElement.children',
			'delete-children': 'command.deleteElement.children',
			'delete-all': 'command.deleteElement.all-elements'
		}
	);
	controls['deleteElement-operation']?.enableHiddenMode?.();
	controls['deleteElement-operation']?.relate?.([
		{
			case: ['delete-element', 'delete-children'],
			targets: [controlRoot(controls['deleteElement-element'])]
		}
	]);
});
</script>

<style>
#deleteElement {
	width: 324px;
	height: 122px;
}

#deleteElement-confirm {
	right: 108px;
	bottom: 10px;
}

#deleteElement-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
