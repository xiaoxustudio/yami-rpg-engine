<template>
	<WindowFrame id="setEvent" :ref="registryRef(fieldEls, 'setEvent')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setEvent.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.setEvent-operation.label') }}</div>
			<SelectBox
				id="setEvent-operation"
				v-tip="t('components.setEvent-operation.tip')"
				:ref="registryRef(fieldEls, 'setEvent-operation')"
				v-focus
				v-model="form.operation"
			/>
			<div class="text">{{ t('components.setEvent-variable.label') }}</div>
			<CustomBox
				id="setEvent-variable"
				v-tip="t('components.setEvent-variable.tip')"
				:ref="registryRef(fieldEls, 'setEvent-variable')"
				v-focus
				type="variable"
				filter="object"
				v-model="form.variable"
			/>
			<div class="text">{{ t('components.setEvent-eventId.label') }}</div>
			<CustomBox
				id="setEvent-eventId"
				v-tip="t('components.setEvent-eventId.tip')"
				:ref="registryRef(fieldEls, 'setEvent-eventId')"
				v-focus
				type="file"
				filter="event"
				v-model="form.eventId"
			/>
			<div class="text">{{ t('components.setEvent-choiceIndex.label') }}</div>
			<NumberVar
				id="setEvent-choiceIndex"
				v-tip="t('components.setEvent-choiceIndex.tip')"
				:ref="registryRef(fieldEls, 'setEvent-choiceIndex')"
				min="0"
				max="255"
				v-model="form.choiceIndex"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useLocalizedOptions } from '@app/composables/useLocalizedOptions';
import { createElementRegistry, registryRef } from '@app/utils/element-registry';
import { composableEls } from '@app/composables/element-registry';

// 本组件的控件元素注册表（替代按 id 查 DOM）
const fieldEls = createElementRegistry(composableEls);
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
	useLocalizedOptions(
		'setEvent-operation',
		[
			'stop-propagation',
			'pause',
			'continue',
			'enable',
			'disable',
			'highest-priority',
			'goto-choice-branch'
		],
		(items) => fieldEls.get('setEvent-operation')?.loadItems?.(items),
		{
			'stop-propagation': 'command.setEvent.stop-propagation',
			pause: 'command.setEvent.pause',
			continue: 'command.setEvent.continue',
			enable: 'command.setEvent.enable',
			disable: 'command.setEvent.disable',
			'highest-priority': 'command.setEvent.highest-priority',
			'goto-choice-branch': 'command.setEvent.goto-choice-branch'
		}
	);
	fieldEls
		.get('setEvent-operation')
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
/* 不能用 scoped：-confirm/-cancel 等元素由 WindowFrame 内部生成 */
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
