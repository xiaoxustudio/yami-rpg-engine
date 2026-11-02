<template>
	<WindowFrame id="controlButton" :ref="controlRef('controlButton')" @confirm="onConfirm">
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
				:ref="controlRef('controlButton-operation')"
				v-focus
				v-model="form.operation"
			/>
			<div class="text">{{ t('components.controlButton-element.label') }}</div>
			<CustomBox
				id="controlButton-element"
				v-tip="t('components.controlButton-element.tip')"
				:ref="controlRef('controlButton-element')"
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
import { useControlButtonCommandSchema } from '@app/composables/commands/useControlButtonCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import { controlRoot, useControlRefs } from '@app/composables/control-refs';

/** 控件 id 联合：模板与脚本共用，拼错在 tsc / vue-tsc 就红。 */
type Id = 'controlButton' | 'controlButton-element' | 'controlButton-operation';

const { controls, controlRef } = useControlRefs<Id>();

const { t } = useI18n();

const { form, save } = useControlButtonCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	useLocalizedOptions(
		'controlButton-operation',
		['select-default', 'select', 'hover-mode', 'active-mode', 'normal-mode'],
		(items) => controls['controlButton-operation']?.loadItems?.(items),
		{
			'select-default': 'command.controlButton.select-default',
			select: 'command.controlButton.select',
			'hover-mode': 'command.controlButton.hover-mode',
			'active-mode': 'command.controlButton.active-mode',
			'normal-mode': 'command.controlButton.normal-mode'
		}
	);
	controls['controlButton-operation']?.enableHiddenMode?.();
	controls['controlButton-operation']?.relate?.([
		{
			case: ['select', 'hover-mode', 'active-mode', 'normal-mode'],
			targets: [controlRoot(controls['controlButton-element'])]
		}
	]);
});
</script>

<style>
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
