<template>
	<WindowFrame id="stopEvent" :ref="controlRef('stopEvent')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.stopEvent.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.stopEvent-type.label') }}</div>
			<SelectBox
				:label="t('components.stopEvent-type.label')"
				id="stopEvent-type"
				v-tip="t('components.stopEvent-type.tip')"
				:ref="controlRef('stopEvent-type')"
				v-focus
				v-model="form.type"
				@write="onTypeWrite"
			/>
			<div class="text">{{ t('components.stopEvent-actor.label') }}</div>
			<CustomBox
				id="stopEvent-actor"
				v-tip="t('components.stopEvent-actor.tip')"
				:ref="controlRef('stopEvent-actor')"
				type="actor"
				v-model="form.actor"
			/>
			<div class="text">{{ t('components.stopEvent-skill.label') }}</div>
			<CustomBox
				id="stopEvent-skill"
				v-tip="t('components.stopEvent-skill.tip')"
				:ref="controlRef('stopEvent-skill')"
				type="skill"
				v-model="form.skill"
			/>
			<div class="text">{{ t('components.stopEvent-state.label') }}</div>
			<CustomBox
				id="stopEvent-state"
				v-tip="t('components.stopEvent-state.tip')"
				:ref="controlRef('stopEvent-state')"
				type="state"
				v-model="form.state"
			/>
			<div class="text">{{ t('components.stopEvent-equipment.label') }}</div>
			<CustomBox
				id="stopEvent-equipment"
				v-tip="t('components.stopEvent-equipment.tip')"
				:ref="controlRef('stopEvent-equipment')"
				type="equipment"
				v-model="form.equipment"
			/>
			<div class="text">{{ t('components.stopEvent-item.label') }}</div>
			<CustomBox
				id="stopEvent-item"
				v-tip="t('components.stopEvent-item.tip')"
				:ref="controlRef('stopEvent-item')"
				type="item"
				v-model="form.item"
			/>
			<div class="text">{{ t('components.stopEvent-light.label') }}</div>
			<CustomBox
				id="stopEvent-light"
				v-tip="t('components.stopEvent-light.tip')"
				:ref="controlRef('stopEvent-light')"
				type="light"
				v-model="form.light"
			/>
			<div class="text">{{ t('components.stopEvent-element.label') }}</div>
			<CustomBox
				id="stopEvent-element"
				v-tip="t('components.stopEvent-element.tip')"
				:ref="controlRef('stopEvent-element')"
				type="element"
				v-model="form.element"
			/>
			<div class="text">{{ t('components.stopEvent-eventId.label') }}</div>
			<CustomBox
				id="stopEvent-eventId"
				v-tip="t('components.stopEvent-eventId.tip')"
				:ref="controlRef('stopEvent-eventId')"
				v-focus
				type="file"
				filter="event"
				v-model="form.eventId"
			/>
			<div class="text">{{ t('components.stopEvent-eventType.label') }}</div>
			<SelectBox
				:label="t('components.stopEvent-eventType.label')"
				id="stopEvent-eventType"
				v-tip="t('components.stopEvent-eventType.tip')"
				:ref="controlRef('stopEvent-eventType')"
				v-focus
				v-model="form.eventType"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStopEventCommandSchema } from '@app/composables/commands/useStopEventCommandSchema';
import { write } from '@app/utils/element-utils';
import { EventEditor } from '@app/commands/event-editor.ts';
import { Enum } from '@app/enum/enum-window.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import { controlRoot, useControlRefs } from '@app/composables/control-refs';

/** 控件 id 联合：模板与脚本共用，拼错在 tsc / vue-tsc 就红。 */
type Id =
	| 'stopEvent'
	| 'stopEvent-actor'
	| 'stopEvent-element'
	| 'stopEvent-equipment'
	| 'stopEvent-eventId'
	| 'stopEvent-eventType'
	| 'stopEvent-item'
	| 'stopEvent-light'
	| 'stopEvent-skill'
	| 'stopEvent-state'
	| 'stopEvent-type';

const { controls, controlRef } = useControlRefs<Id>();

const { t } = useI18n();

const { form, save } = useStopEventCommandSchema();

const onTypeWrite = (value: unknown) => {
	const type = value as string;
	if (type === 'current') {
		return;
	}
	const source = EventEditor.types?.[type] ?? EventEditor.types?.all;
	if (!source) {
		return;
	}
	// 选择框能力在实例/旁表上（元素只作 DOM）
	const elEventType = controls['stopEvent-eventType'] as HTMLElement & {
		loadItems(items: unknown[]): void;
		createTooltip?(): void;
	};
	const eventTypes = Enum.getMergedItems!(source, type + '-event');
	elEventType?.loadItems?.(eventTypes);
	elEventType?.createTooltip?.();
	write(elEventType, eventTypes[0].value);
	form.eventType = eventTypes[0].value;
};

const onConfirm = () => {
	save();
};

onMounted(() => {
	controls['stopEvent-type']?.loadItems?.([
		{ name: t('command.stopEvent.current') || 'Current', value: 'current' },
		{ name: 'Global', value: 'global' },
		{ name: t('command.stopEvent.scene') || 'Scene', value: 'scene' },
		{ name: 'Actor', value: 'actor' },
		{ name: 'Skill', value: 'skill' },
		{ name: 'State', value: 'state' },
		{ name: 'Equipment', value: 'equipment' },
		{ name: 'Item', value: 'item' },
		{ name: 'Light', value: 'light' },
		{ name: 'Element', value: 'element' }
	]);
	controls['stopEvent-type']?.enableHiddenMode?.();
	controls['stopEvent-type']?.relate?.([
		{ case: 'global', targets: [controlRoot(controls['stopEvent-eventId'])] },
		{ case: 'scene', targets: [controlRoot(controls['stopEvent-eventType'])] },
		{
			case: 'actor',
			targets: [
				controlRoot(controls['stopEvent-actor']),
				controlRoot(controls['stopEvent-eventType'])
			]
		},
		{
			case: 'skill',
			targets: [
				controlRoot(controls['stopEvent-skill']),
				controlRoot(controls['stopEvent-eventType'])
			]
		},
		{
			case: 'state',
			targets: [
				controlRoot(controls['stopEvent-state']),
				controlRoot(controls['stopEvent-eventType'])
			]
		},
		{
			case: 'equipment',
			targets: [
				controlRoot(controls['stopEvent-equipment']),
				controlRoot(controls['stopEvent-eventType'])
			]
		},
		{
			case: 'item',
			targets: [
				controlRoot(controls['stopEvent-item']),
				controlRoot(controls['stopEvent-eventType'])
			]
		},
		{
			case: 'light',
			targets: [
				controlRoot(controls['stopEvent-light']),
				controlRoot(controls['stopEvent-eventType'])
			]
		},
		{
			case: 'element',
			targets: [
				controlRoot(controls['stopEvent-element']),
				controlRoot(controls['stopEvent-eventType'])
			]
		}
	]);
});
</script>

<style>
#stopEvent {
	width: 324px;
	height: 146px;
}

#stopEvent-confirm {
	right: 108px;
	bottom: 10px;
}

#stopEvent-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
