<template>
	<WindowFrame id="stopEvent" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.stopEvent.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
		<div class="text">Type</div>
		<SelectBox id="stopEvent-type"
				:ref="registryRef(fieldEls, 'stopEvent-type')" v-focus v-model="form.type" @write="onTypeWrite" />
		<div class="text">Actor</div>
		<CustomBox id="stopEvent-actor"
				:ref="registryRef(fieldEls, 'stopEvent-actor')" type="actor" v-model="form.actor" />
		<div class="text">Skill</div>
		<CustomBox id="stopEvent-skill"
				:ref="registryRef(fieldEls, 'stopEvent-skill')" type="skill" v-model="form.skill" />
		<div class="text">State</div>
		<CustomBox id="stopEvent-state"
				:ref="registryRef(fieldEls, 'stopEvent-state')" type="state" v-model="form.state" />
		<div class="text">Equipment</div>
		<CustomBox id="stopEvent-equipment"
				:ref="registryRef(fieldEls, 'stopEvent-equipment')" type="equipment" v-model="form.equipment" />
		<div class="text">Item</div>
		<CustomBox id="stopEvent-item"
				:ref="registryRef(fieldEls, 'stopEvent-item')" type="item" v-model="form.item" />
		<div class="text">Light</div>
		<CustomBox id="stopEvent-light"
				:ref="registryRef(fieldEls, 'stopEvent-light')" type="light" v-model="form.light" />
		<div class="text">Element</div>
		<CustomBox id="stopEvent-element"
				:ref="registryRef(fieldEls, 'stopEvent-element')" type="element" v-model="form.element" />
		<div class="text">Event</div>
		<CustomBox
			id="stopEvent-eventId"
				:ref="registryRef(fieldEls, 'stopEvent-eventId')"
			v-focus
			type="file"
			filter="event"
			v-model="form.eventId"
		/>
			<div class="text">Event</div>
			<SelectBox id="stopEvent-eventType"
				:ref="registryRef(fieldEls, 'stopEvent-eventType')" v-focus v-model="form.eventType" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { createElementRegistry, registryRef } from '@app/utils/element-registry';

// P5b 批次 4：本组件的控件元素注册表（替代按 id 查 DOM）
const fieldEls = createElementRegistry();
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
	const elEventType = fieldEls.get('stopEvent-eventType') as HTMLElement;
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
	fieldEls.get('stopEvent-type')?.loadItems?.([
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
	fieldEls.get('stopEvent-type')
		?.enableHiddenMode?.()
		?.relate?.([
			{ case: 'global', targets: [fieldEls.get('stopEvent-eventId')] },
			{ case: 'scene', targets: [fieldEls.get('stopEvent-eventType')] },
			{
				case: 'actor',
				targets: [fieldEls.get('stopEvent-actor'), fieldEls.get('stopEvent-eventType')]
			},
			{
				case: 'skill',
				targets: [fieldEls.get('stopEvent-skill'), fieldEls.get('stopEvent-eventType')]
			},
			{
				case: 'state',
				targets: [fieldEls.get('stopEvent-state'), fieldEls.get('stopEvent-eventType')]
			},
			{
				case: 'equipment',
				targets: [fieldEls.get('stopEvent-equipment'), fieldEls.get('stopEvent-eventType')]
			},
			{
				case: 'item',
				targets: [fieldEls.get('stopEvent-item'), fieldEls.get('stopEvent-eventType')]
			},
			{
				case: 'light',
				targets: [fieldEls.get('stopEvent-light'), fieldEls.get('stopEvent-eventType')]
			},
			{
				case: 'element',
				targets: [fieldEls.get('stopEvent-element'), fieldEls.get('stopEvent-eventType')]
			}
		]);
});
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
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
