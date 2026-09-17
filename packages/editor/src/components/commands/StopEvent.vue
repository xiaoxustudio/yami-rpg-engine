<template>
	<WindowFrame id="stopEvent"
				:ref="registryRef(fieldEls, 'stopEvent')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.stopEvent.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
		<div class="text">{{ t('components.stopEvent-type.label') }}</div>
		<SelectBox id="stopEvent-type"
				v-tip="t('components.stopEvent-type.tip')"
				:ref="registryRef(fieldEls, 'stopEvent-type')" v-focus v-model="form.type" @write="onTypeWrite" />
		<div class="text">{{ t('components.stopEvent-actor.label') }}</div>
		<CustomBox id="stopEvent-actor"
				v-tip="t('components.stopEvent-actor.tip')"
				:ref="registryRef(fieldEls, 'stopEvent-actor')" type="actor" v-model="form.actor" />
		<div class="text">{{ t('components.stopEvent-skill.label') }}</div>
		<CustomBox id="stopEvent-skill"
				v-tip="t('components.stopEvent-skill.tip')"
				:ref="registryRef(fieldEls, 'stopEvent-skill')" type="skill" v-model="form.skill" />
		<div class="text">{{ t('components.stopEvent-state.label') }}</div>
		<CustomBox id="stopEvent-state"
				v-tip="t('components.stopEvent-state.tip')"
				:ref="registryRef(fieldEls, 'stopEvent-state')" type="state" v-model="form.state" />
		<div class="text">{{ t('components.stopEvent-equipment.label') }}</div>
		<CustomBox id="stopEvent-equipment"
				v-tip="t('components.stopEvent-equipment.tip')"
				:ref="registryRef(fieldEls, 'stopEvent-equipment')" type="equipment" v-model="form.equipment" />
		<div class="text">{{ t('components.stopEvent-item.label') }}</div>
		<CustomBox id="stopEvent-item"
				v-tip="t('components.stopEvent-item.tip')"
				:ref="registryRef(fieldEls, 'stopEvent-item')" type="item" v-model="form.item" />
		<div class="text">{{ t('components.stopEvent-light.label') }}</div>
		<CustomBox id="stopEvent-light"
				v-tip="t('components.stopEvent-light.tip')"
				:ref="registryRef(fieldEls, 'stopEvent-light')" type="light" v-model="form.light" />
		<div class="text">{{ t('components.stopEvent-element.label') }}</div>
		<CustomBox id="stopEvent-element"
				v-tip="t('components.stopEvent-element.tip')"
				:ref="registryRef(fieldEls, 'stopEvent-element')" type="element" v-model="form.element" />
		<div class="text">{{ t('components.stopEvent-eventId.label') }}</div>
		<CustomBox
			id="stopEvent-eventId"
				v-tip="t('components.stopEvent-eventId.tip')"
				:ref="registryRef(fieldEls, 'stopEvent-eventId')"
			v-focus
			type="file"
			filter="event"
			v-model="form.eventId"
		/>
			<div class="text">{{ t('components.stopEvent-eventType.label') }}</div>
			<SelectBox id="stopEvent-eventType"
				v-tip="t('components.stopEvent-eventType.tip')"
				:ref="registryRef(fieldEls, 'stopEvent-eventType')" v-focus v-model="form.eventType" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { createElementRegistry, registryRef } from '@app/utils/element-registry';
import { composableEls } from '@app/composables/element-registry';

// P5b 批次 4：本组件的控件元素注册表（替代按 id 查 DOM）
const fieldEls = createElementRegistry(composableEls);
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
import type { YamiElement } from '@app/types/element-api';

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
	const elEventType = fieldEls.get('stopEvent-eventType') as YamiElement;
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
