<template>
	<WindowFrame id="setEvent" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setEvent.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Operation</div>
			<SelectBox id="setEvent-operation"
				v-tip="t('components.setEvent-operation.tip')"
				:ref="registryRef(fieldEls, 'setEvent-operation')" v-focus v-model="form.operation" />
			<div class="text">Variable</div>
			<CustomBox
				id="setEvent-variable"
				v-tip="t('components.setEvent-variable.tip')"
				:ref="registryRef(fieldEls, 'setEvent-variable')"
				v-focus
				type="variable"
				filter="object"
				v-model="form.variable"
			/>
			<div class="text">Event</div>
			<CustomBox
				id="setEvent-eventId"
				v-tip="t('components.setEvent-eventId.tip')"
				:ref="registryRef(fieldEls, 'setEvent-eventId')"
				v-focus
				type="file"
				filter="event"
				v-model="form.eventId"
			/>
			<div class="text">Choice Index</div>
			<NumberVar id="setEvent-choiceIndex"
				v-tip="t('components.setEvent-choiceIndex.tip')"
				:ref="registryRef(fieldEls, 'setEvent-choiceIndex')" min="0" max="255" v-model="form.choiceIndex" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { createElementRegistry, registryRef } from '@app/utils/element-registry';

// P5b 批次 4：本组件的控件元素注册表（替代按 id 查 DOM）
const fieldEls = createElementRegistry();
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSetEventCommandSchema } from '@app/composables/commands/useSetEventCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useSetEventCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	fieldEls.get('setEvent-operation')?.loadItems?.([
		{
			name: t('command.setEvent.stop-propagation') || 'Stop Propagation',
			value: 'stop-propagation'
		},
		{ name: t('command.setEvent.pause') || 'Pause and Save to Variable', value: 'pause' },
		{ name: t('command.setEvent.continue') || 'Continue and Reset Variable', value: 'continue' },
		{ name: t('command.setEvent.enable') || 'Enable Global Event', value: 'enable' },
		{ name: t('command.setEvent.disable') || 'Disable Global Event', value: 'disable' },
		{
			name: t('command.setEvent.highest-priority') || 'Set to Highest Priority',
			value: 'highest-priority'
		},
		{
			name: t('command.setEvent.goto-choice-branch') || 'Go to Choice Branch',
			value: 'goto-choice-branch'
		}
	]);
	fieldEls.get('setEvent-operation')
		?.enableHiddenMode?.()
		?.relate?.([
			{
				case: ['pause', 'continue'],
				targets: [fieldEls.get('setEvent-variable')]
			},
			{
				case: ['enable', 'disable', 'highest-priority'],
				targets: [fieldEls.get('setEvent-eventId')]
			},
			{
				case: 'goto-choice-branch',
				targets: [fieldEls.get('setEvent-choiceIndex')]
			}
		]);
});
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
#setEvent {
	width: 324px;
	height: 122px;
}

#setEvent-confirm {
	right: 108px;
	bottom: 10px;
}

#setEvent-cancel {
	right: 10px;
	bottom: 10px;
}

</style>
