<template>
	<WindowFrame id="renderOutline" :ref="controlRef('renderOutline')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.renderOutline.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.renderOutline-operation.label') }}</div>
			<SelectBox
				:label="t('components.renderOutline-operation.label')"
				id="renderOutline-operation"
				v-tip="t('components.renderOutline-operation.tip')"
				:ref="controlRef('renderOutline-operation')"
				v-focus
				v-model="form.operation"
			/>
			<div class="text">{{ t('components.renderOutline-actor.label') }}</div>
			<CustomBox
				id="renderOutline-actor"
				v-tip="t('components.renderOutline-actor.tip')"
				:ref="controlRef('renderOutline-actor')"
				type="actor"
				v-model="form.actor"
			/>
			<div class="text">{{ t('components.renderOutline-color.label') }}</div>
			<ColorBox
				:label="t('components.renderOutline-color.label')"
				id="renderOutline-color"
				v-tip="t('components.renderOutline-color.tip')"
				:ref="controlRef('renderOutline-color')"
				v-model="color"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useLocalizedOptions } from '@app/composables/useLocalizedOptions';

import { computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRenderOutlineCommandSchema } from '@app/composables/commands/useRenderOutlineCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import ColorBox from '@app/components/common/ColorBox.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import { controlRoot, useControlRefs } from '@app/composables/control-refs';

/** 控件 id 联合：模板与脚本共用，拼错在 tsc / vue-tsc 就红。 */
type Id =
	| 'renderOutline'
	| 'renderOutline-actor'
	| 'renderOutline-color'
	| 'renderOutline-operation';

const { controls, controlRef } = useControlRefs<Id>();

const { t } = useI18n();

const { form, save } = useRenderOutlineCommandSchema();

const color = computed({
	get: () => form.color as string,
	set: (value) => {
		form.color = value;
	}
});

const onConfirm = () => {
	save();
};

onMounted(() => {
	useLocalizedOptions(
		'renderOutline-operation',
		['add', 'remove', 'reset'],
		(items) => controls['renderOutline-operation']?.loadItems?.(items),
		{
			add: 'command.renderOutline.add',
			remove: 'command.renderOutline.remove',
			reset: 'command.renderOutline.reset'
		}
	);
	controls['renderOutline-operation']?.enableHiddenMode?.();
	controls['renderOutline-operation']?.relate?.([
		{
			case: 'add',
			targets: [
				controlRoot(controls['renderOutline-actor']),
				controlRoot(controls['renderOutline-color'])
			]
		},
		{ case: 'remove', targets: [controlRoot(controls['renderOutline-actor'])] }
	]);
});
</script>

<style>
#renderOutline {
	width: 324px;
	height: 146px;
}

#renderOutline-confirm {
	right: 108px;
	bottom: 10px;
}

#renderOutline-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
