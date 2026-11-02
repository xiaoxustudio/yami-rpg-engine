<template>
	<WindowFrame id="setObject" :ref="controlRef('setObject')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setObject.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.setObject-variable.label') }}</div>
			<CustomBox
				id="setObject-variable"
				:ref="controlRef('setObject-variable')"
				v-tip="t('components.setObject-variable.tip')"
				v-focus
				type="variable"
				filter="object"
				v-model="form.variable"
			/>
			<div class="text">{{ t('components.setObject-operand-type.label') }}</div>
			<SelectBox
				:label="t('components.setObject-operand-type.label')"
				id="setObject-operand-type"
				v-tip="t('components.setObject-operand-type.tip')"
				:ref="controlRef('setObject-operand-type')"
				v-model="form['operand-type']"
			/>
			<div class="text">{{ t('components.setObject-operand-actor.label') }}</div>
			<CustomBox
				id="setObject-operand-actor"
				v-tip="t('components.setObject-operand-actor.tip')"
				:ref="controlRef('setObject-operand-actor')"
				type="actor"
				v-model="form['operand-actor']"
			/>
			<div class="text">{{ t('components.setObject-operand-skill.label') }}</div>
			<CustomBox
				id="setObject-operand-skill"
				v-tip="t('components.setObject-operand-skill.tip')"
				:ref="controlRef('setObject-operand-skill')"
				type="skill"
				v-model="form['operand-skill']"
			/>
			<div class="text">{{ t('components.setObject-operand-state.label') }}</div>
			<CustomBox
				id="setObject-operand-state"
				v-tip="t('components.setObject-operand-state.tip')"
				:ref="controlRef('setObject-operand-state')"
				type="state"
				v-model="form['operand-state']"
			/>
			<div class="text">{{ t('components.setObject-operand-equipment.label') }}</div>
			<CustomBox
				id="setObject-operand-equipment"
				v-tip="t('components.setObject-operand-equipment.tip')"
				:ref="controlRef('setObject-operand-equipment')"
				type="equipment"
				v-model="form['operand-equipment']"
			/>
			<div class="text">{{ t('components.setObject-operand-item.label') }}</div>
			<CustomBox
				id="setObject-operand-item"
				v-tip="t('components.setObject-operand-item.tip')"
				:ref="controlRef('setObject-operand-item')"
				type="item"
				v-model="form['operand-item']"
			/>
			<div class="text">{{ t('components.setObject-operand-trigger.label') }}</div>
			<CustomBox
				id="setObject-operand-trigger"
				v-tip="t('components.setObject-operand-trigger.tip')"
				:ref="controlRef('setObject-operand-trigger')"
				type="trigger"
				v-model="form['operand-trigger']"
			/>
			<div class="text">{{ t('components.setObject-operand-light.label') }}</div>
			<CustomBox
				id="setObject-operand-light"
				v-tip="t('components.setObject-operand-light.tip')"
				:ref="controlRef('setObject-operand-light')"
				type="light"
				v-model="form['operand-light']"
			/>
			<div class="text">{{ t('components.setObject-operand-object.label') }}</div>
			<CustomBox
				id="setObject-operand-object"
				v-tip="t('components.setObject-operand-object.tip')"
				:ref="controlRef('setObject-operand-object')"
				type="object"
				v-model="form['operand-object']"
			/>
			<div class="text">{{ t('components.setObject-operand-element.label') }}</div>
			<CustomBox
				id="setObject-operand-element"
				v-tip="t('components.setObject-operand-element.tip')"
				:ref="controlRef('setObject-operand-element')"
				type="element"
				v-model="form['operand-element']"
			/>
			<div class="text">{{ t('components.setObject-operand-variable.label') }}</div>
			<CustomBox
				id="setObject-operand-variable"
				v-tip="t('components.setObject-operand-variable.tip')"
				:ref="controlRef('setObject-operand-variable')"
				v-focus
				type="variable"
				filter="object"
				v-model="form['operand-variable']"
			/>
			<div class="text">{{ t('components.setObject-operand-list-index.label') }}</div>
			<NumberVar
				id="setObject-operand-list-index"
				v-tip="t('components.setObject-operand-list-index.tip')"
				:ref="controlRef('setObject-operand-list-index')"
				min="0"
				max="1000000000"
				v-model="form['operand-list-index']"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useLocalizedOptions } from '@app/composables/useLocalizedOptions';

import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSetObjectCommandSchema } from '@app/composables/commands/useSetObjectCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import { controlRoot, useControlRefs } from '@app/composables/control-refs';

/** 控件 id 联合：模板与脚本共用，拼错在 tsc / vue-tsc 就红。 */
type Id =
	| 'setObject'
	| 'setObject-operand-actor'
	| 'setObject-operand-element'
	| 'setObject-operand-equipment'
	| 'setObject-operand-item'
	| 'setObject-operand-light'
	| 'setObject-operand-list-index'
	| 'setObject-operand-object'
	| 'setObject-operand-skill'
	| 'setObject-operand-state'
	| 'setObject-operand-trigger'
	| 'setObject-operand-type'
	| 'setObject-operand-variable'
	| 'setObject-variable';

const { controls, controlRef } = useControlRefs<Id>();

const { t } = useI18n();

const { form, save } = useSetObjectCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	useLocalizedOptions(
		'setObject-operand-type',
		[
			'none',
			'actor',
			'skill',
			'state',
			'equipment',
			'item',
			'trigger',
			'light',
			'object',
			'element',
			'variable',
			'list'
		],
		(items) => controls['setObject-operand-type']?.loadItems?.(items)
	);
	controls['setObject-operand-type']?.enableHiddenMode?.();
	controls['setObject-operand-type']?.relate?.([
		{ case: 'actor', targets: [controlRoot(controls['setObject-operand-actor'])] },
		{ case: 'skill', targets: [controlRoot(controls['setObject-operand-skill'])] },
		{ case: 'state', targets: [controlRoot(controls['setObject-operand-state'])] },
		{
			case: 'equipment',
			targets: [controlRoot(controls['setObject-operand-equipment'])]
		},
		{ case: 'item', targets: [controlRoot(controls['setObject-operand-item'])] },
		{ case: 'trigger', targets: [controlRoot(controls['setObject-operand-trigger'])] },
		{ case: 'light', targets: [controlRoot(controls['setObject-operand-light'])] },
		{ case: 'object', targets: [controlRoot(controls['setObject-operand-object'])] },
		{ case: 'element', targets: [controlRoot(controls['setObject-operand-element'])] },
		{
			case: 'variable',
			targets: [controlRoot(controls['setObject-operand-variable'])]
		},
		{
			case: 'list',
			targets: [
				controlRoot(controls['setObject-operand-variable']),
				controlRoot(controls['setObject-operand-list-index'])
			]
		}
	]);
});
</script>

<style>
#setObject {
	width: 324px;
	height: 170px;
}

#setObject-confirm {
	right: 108px;
	bottom: 10px;
}

#setObject-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
