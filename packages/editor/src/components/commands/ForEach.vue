<template>
	<WindowFrame :ref="controlRef('forEach')" id="forEach" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.forEach.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.forEach-data.label') }}</div>
			<SelectBox
				:label="t('components.forEach-data.label')"
				id="forEach-data"
				v-tip="t('components.forEach-data.tip')"
				:ref="controlRef('forEach-data')"
				v-focus
				v-model="form.data"
			/>
			<div class="text">{{ t('components.forEach-list.label') }}</div>
			<CustomBox
				id="forEach-list"
				v-tip="t('components.forEach-list.tip')"
				:ref="controlRef('forEach-list')"
				v-focus
				type="variable"
				filter="object"
				v-model="form.list"
			/>
			<div class="text">{{ t('components.forEach-actor.label') }}</div>
			<CustomBox
				id="forEach-actor"
				v-tip="t('components.forEach-actor.tip')"
				:ref="controlRef('forEach-actor')"
				type="actor"
				v-model="form.actor"
			/>
			<div class="text">{{ t('components.forEach-element.label') }}</div>
			<CustomBox
				id="forEach-element"
				v-tip="t('components.forEach-element.tip')"
				:ref="controlRef('forEach-element')"
				type="element"
				v-model="form.element"
			/>
			<div class="text">{{ t('components.forEach-attribute-groupId.label') }}</div>
			<CustomBox
				id="forEach-attribute-groupId"
				v-tip="t('components.forEach-attribute-groupId.tip')"
				:ref="controlRef('forEach-attribute-groupId')"
				v-focus
				type="attribute-group"
				v-model="form.attributeGroupId"
			/>
			<div class="text">{{ t('components.forEach-enum-groupId.label') }}</div>
			<CustomBox
				id="forEach-enum-groupId"
				v-tip="t('components.forEach-enum-groupId.tip')"
				:ref="controlRef('forEach-enum-groupId')"
				v-focus
				type="enum-group"
				v-model="form.enumGroupId"
			/>
			<div class="text">{{ t('components.forEach-variable.label') }}</div>
			<CustomBox
				id="forEach-variable"
				v-tip="t('components.forEach-variable.tip')"
				:ref="controlRef('forEach-variable')"
				v-focus
				type="variable"
				filter="object"
				v-model="form.variable"
			/>
			<div class="text">{{ t('components.forEach-saveIndex.label') }}</div>
			<CustomBox
				id="forEach-saveIndex"
				v-tip="t('components.forEach-saveIndex.tip')"
				:ref="controlRef('forEach-saveIndex')"
				v-focus
				type="variable"
				filter="number"
				v-model="form.saveIndex"
			/>
			<div class="text">{{ t('components.forEach-touchId.label') }}</div>
			<CustomBox
				id="forEach-touchId"
				v-tip="t('components.forEach-touchId.tip')"
				:ref="controlRef('forEach-touchId')"
				v-focus
				type="variable"
				filter="number"
				v-model="form.touchId"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useLocalizedOptions } from '@app/composables/useLocalizedOptions';
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { on } from '@app/utils/element-utils.ts';
import { useForEachCommandSchema } from '@app/composables/commands/useForEachCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import { controlRoot, useControlRefs } from '@app/composables/control-refs';

/** 控件 id 联合：模板与脚本共用，拼错在 tsc / vue-tsc 就红。 */
type Id =
	| 'forEach'
	| 'forEach-actor'
	| 'forEach-attribute-groupId'
	| 'forEach-data'
	| 'forEach-element'
	| 'forEach-enum-groupId'
	| 'forEach-list'
	| 'forEach-saveIndex'
	| 'forEach-touchId'
	| 'forEach-variable';

const { controls, controlRef } = useControlRefs<Id>();

const { t } = useI18n();

const { form, save, windowClosed } = useForEachCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	useLocalizedOptions(
		'forEach-data',
		[
			'list',
			'skill',
			'state',
			'equipment',
			'inventory',
			'element',
			'member',
			'attribute',
			'enum',
			'save',
			'touch',
			'changed-touch'
		],
		(items) => controls['forEach-data']?.loadItems?.(items),
		{
			list: 'command.forEach.list',
			skill: 'command.forEach.skill',
			state: 'command.forEach.state',
			equipment: 'command.forEach.equipment',
			inventory: 'command.forEach.inventory',
			element: 'command.forEach.element',
			member: 'command.forEach.member',
			attribute: 'command.forEach.attribute',
			enum: 'command.forEach.enum',
			save: 'command.forEach.save',
			touch: 'command.forEach.touch',
			'changed-touch': 'command.forEach.changed-touch'
		}
	);
	controls['forEach-data']?.enableHiddenMode?.();
	controls['forEach-data']?.relate?.([
		{
			case: 'list',
			targets: [
				controlRoot(controls['forEach-list']),
				controlRoot(controls['forEach-variable'])
			]
		},
		{
			case: ['skill', 'state', 'equipment', 'inventory'],
			targets: [
				controlRoot(controls['forEach-actor']),
				controlRoot(controls['forEach-variable'])
			]
		},
		{
			case: 'element',
			targets: [
				controlRoot(controls['forEach-element']),
				controlRoot(controls['forEach-variable'])
			]
		},
		{ case: 'member', targets: [controlRoot(controls['forEach-variable'])] },
		{
			case: 'attribute',
			targets: [
				controlRoot(controls['forEach-attribute-groupId']),
				controlRoot(controls['forEach-variable'])
			]
		},
		{
			case: 'enum',
			targets: [
				controlRoot(controls['forEach-enum-groupId']),
				controlRoot(controls['forEach-variable'])
			]
		},
		{ case: 'save', targets: [controlRoot(controls['forEach-saveIndex'])] },
		{
			case: ['touch', 'changed-touch'],
			targets: [controlRoot(controls['forEach-touchId'])]
		}
	]);
	on(controls['forEach'], 'closed', () => windowClosed(new Event('closed')));
});
</script>

<style>
#forEach {
	width: 324px;
	height: 146px;
}

#forEach-confirm {
	right: 108px;
	bottom: 10px;
}

#forEach-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
