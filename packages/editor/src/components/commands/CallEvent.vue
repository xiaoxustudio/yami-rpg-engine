<template>
	<WindowFrame id="callEvent"
				:ref="registryRef(fieldEls, 'callEvent')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.callEvent.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
		<div class="text">Type</div>
		<SelectBox id="callEvent-type"
				v-tip="t('components.callEvent-type.tip')"
				:ref="registryRef(fieldEls, 'callEvent-type')" v-focus v-model="form.type" @write="onTypeWrite" />
		<div class="text">Actor</div>
		<CustomBox id="callEvent-actor"
				v-tip="t('components.callEvent-actor.tip')"
				:ref="registryRef(fieldEls, 'callEvent-actor')" type="actor" v-model="form.actor" />
		<div class="text">Skill</div>
		<CustomBox id="callEvent-skill"
				v-tip="t('components.callEvent-skill.tip')"
				:ref="registryRef(fieldEls, 'callEvent-skill')" type="skill" v-model="form.skill" />
		<div class="text">State</div>
		<CustomBox id="callEvent-state"
				v-tip="t('components.callEvent-state.tip')"
				:ref="registryRef(fieldEls, 'callEvent-state')" type="state" v-model="form.state" />
		<div class="text">Equipment</div>
		<CustomBox id="callEvent-equipment"
				v-tip="t('components.callEvent-equipment.tip')"
				:ref="registryRef(fieldEls, 'callEvent-equipment')" type="equipment" v-model="form.equipment" />
		<div class="text">Item</div>
		<CustomBox id="callEvent-item"
				v-tip="t('components.callEvent-item.tip')"
				:ref="registryRef(fieldEls, 'callEvent-item')" type="item" v-model="form.item" />
		<div class="text">Light</div>
		<CustomBox id="callEvent-light"
				v-tip="t('components.callEvent-light.tip')"
				:ref="registryRef(fieldEls, 'callEvent-light')" type="light" v-model="form.light" />
		<div class="text">Element</div>
		<CustomBox id="callEvent-element"
				v-tip="t('components.callEvent-element.tip')"
				:ref="registryRef(fieldEls, 'callEvent-element')" type="element" v-model="form.element" />
		<div class="text">Event</div>
		<CustomBox
			id="callEvent-eventId"
				v-tip="t('components.callEvent-eventId.tip')"
				:ref="registryRef(fieldEls, 'callEvent-eventId')"
			v-focus
			type="file"
			filter="event"
			v-model="form.eventId"
			@write="onEventIdWrite"
			@input="onEventIdInput"
		/>
			<div class="text">Event</div>
			<SelectBox id="callEvent-eventType"
				v-tip="t('components.callEvent-eventType.tip')"
				:ref="registryRef(fieldEls, 'callEvent-eventType')" v-focus v-model="form.eventType" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { createElementRegistry, registryRef } from '@app/utils/element-registry';

// P5b 批次 4：本组件的控件元素注册表（替代按 id 查 DOM）
const fieldEls = createElementRegistry();
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useCallEventCommandSchema } from '@app/composables/commands/useCallEventCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save, typeWrite, eventIdWrite, eventIdInput, onWindowClosed } =
	useCallEventCommandSchema();

const onTypeWrite = (value: unknown) => {
	typeWrite({ value: value as string });
};

const onEventIdWrite = (value: unknown) => {
	eventIdWrite({ value: value as string });
};

const onEventIdInput = (value: unknown) => {
	eventIdInput({ value: value as string });
};

const onConfirm = () => {
	save();
};

onMounted(() => {
	fieldEls.get('callEvent-type')?.loadItems?.([
		{ name: 'Global', value: 'global' },
		{ name: t('command.callEvent.inherited') || 'Inherited', value: 'inherited' },
		{ name: t('command.callEvent.scene') || 'Scene', value: 'scene' },
		{ name: 'Actor', value: 'actor' },
		{ name: 'Skill', value: 'skill' },
		{ name: 'State', value: 'state' },
		{ name: 'Equipment', value: 'equipment' },
		{ name: 'Item', value: 'item' },
		{ name: 'Light', value: 'light' },
		{ name: 'Element', value: 'element' }
	]);

	fieldEls.get('callEvent-type')
		?.enableHiddenMode?.()
		?.relate?.([
			{ case: 'global', targets: [fieldEls.get('callEvent-eventId')] },
			{ case: 'scene', targets: [fieldEls.get('callEvent-eventType')] },
			{
				case: 'actor',
				targets: [fieldEls.get('callEvent-actor'), fieldEls.get('callEvent-eventType')]
			},
			{
				case: 'skill',
				targets: [fieldEls.get('callEvent-skill'), fieldEls.get('callEvent-eventType')]
			},
			{
				case: 'state',
				targets: [fieldEls.get('callEvent-state'), fieldEls.get('callEvent-eventType')]
			},
			{
				case: 'equipment',
				targets: [fieldEls.get('callEvent-equipment'), fieldEls.get('callEvent-eventType')]
			},
			{
				case: 'item',
				targets: [fieldEls.get('callEvent-item'), fieldEls.get('callEvent-eventType')]
			},
			{
				case: 'light',
				targets: [fieldEls.get('callEvent-light'), fieldEls.get('callEvent-eventType')]
			},
			{
				case: 'element',
				targets: [fieldEls.get('callEvent-element'), fieldEls.get('callEvent-eventType')]
			}
		]);

	fieldEls.get('callEvent')?.on?.('closed', () => {
		onWindowClosed();
	});
});
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
#callEvent {
	width: 324px;
	height: 146px;
}

#callEvent-confirm {
	right: 108px;
	bottom: 10px;
}

#callEvent-cancel {
	right: 10px;
	bottom: 10px;
}

</style>
