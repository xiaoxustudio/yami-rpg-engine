<template>
	<WindowFrame
		id="callEvent"
		:ref="controlRef('callEvent')"
		@confirm="onConfirm"
		@closed="onClosed"
	>
		<template #title
			><TitleBar
				>{{ t('components.callEvent.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.callEvent-type.label') }}</div>
			<SelectBox
				:label="t('components.callEvent-type.label')"
				id="callEvent-type"
				v-tip="t('components.callEvent-type.tip')"
				:ref="controlRef('callEvent-type')"
				v-focus
				v-model="form.type"
				@write="onTypeWrite"
			/>
			<div class="text">{{ t('components.callEvent-actor.label') }}</div>
			<CustomBox
				id="callEvent-actor"
				v-tip="t('components.callEvent-actor.tip')"
				:ref="controlRef('callEvent-actor')"
				type="actor"
				v-model="form.actor"
			/>
			<div class="text">{{ t('components.callEvent-skill.label') }}</div>
			<CustomBox
				id="callEvent-skill"
				v-tip="t('components.callEvent-skill.tip')"
				:ref="controlRef('callEvent-skill')"
				type="skill"
				v-model="form.skill"
			/>
			<div class="text">{{ t('components.callEvent-state.label') }}</div>
			<CustomBox
				id="callEvent-state"
				v-tip="t('components.callEvent-state.tip')"
				:ref="controlRef('callEvent-state')"
				type="state"
				v-model="form.state"
			/>
			<div class="text">{{ t('components.callEvent-equipment.label') }}</div>
			<CustomBox
				id="callEvent-equipment"
				v-tip="t('components.callEvent-equipment.tip')"
				:ref="controlRef('callEvent-equipment')"
				type="equipment"
				v-model="form.equipment"
			/>
			<div class="text">{{ t('components.callEvent-item.label') }}</div>
			<CustomBox
				id="callEvent-item"
				v-tip="t('components.callEvent-item.tip')"
				:ref="controlRef('callEvent-item')"
				type="item"
				v-model="form.item"
			/>
			<div class="text">{{ t('components.callEvent-light.label') }}</div>
			<CustomBox
				id="callEvent-light"
				v-tip="t('components.callEvent-light.tip')"
				:ref="controlRef('callEvent-light')"
				type="light"
				v-model="form.light"
			/>
			<div class="text">{{ t('components.callEvent-element.label') }}</div>
			<CustomBox
				id="callEvent-element"
				v-tip="t('components.callEvent-element.tip')"
				:ref="controlRef('callEvent-element')"
				type="element"
				v-model="form.element"
			/>
			<div class="text">{{ t('components.callEvent-eventId.label') }}</div>
			<CustomBox
				id="callEvent-eventId"
				v-tip="t('components.callEvent-eventId.tip')"
				:ref="controlRef('callEvent-eventId')"
				v-focus
				type="file"
				filter="event"
				v-model="form.eventId"
				@write="onEventIdWrite"
				@input="onEventIdInput"
			/>
			<div class="text">{{ t('components.callEvent-eventType.label') }}</div>
			<SelectBox
				:label="t('components.callEvent-eventType.label')"
				id="callEvent-eventType"
				v-tip="t('components.callEvent-eventType.tip')"
				:ref="controlRef('callEvent-eventType')"
				v-focus
				v-model="form.eventType"
			/>
		</div>

		<div class="hidden">
			<div
				class="text call-event-component"
				id="callEvent-label-template"
				:ref="controlRef('callEvent-label-template')"
			></div>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { setupCallEventFields } from '@app/composables/useCallEventFields';

import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useCallEventCommandSchema } from '@app/composables/commands/useCallEventCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import { useControlRefs } from '@app/composables/control-refs';

/** 控件 id 联合：模板与脚本共用，拼错在 tsc / vue-tsc 就红。 */
type Id =
	| 'callEvent'
	| 'callEvent-actor'
	| 'callEvent-element'
	| 'callEvent-equipment'
	| 'callEvent-eventId'
	| 'callEvent-eventType'
	| 'callEvent-item'
	| 'callEvent-label-template'
	| 'callEvent-light'
	| 'callEvent-skill'
	| 'callEvent-state'
	| 'callEvent-type';

const { controls, controlRef } = useControlRefs<Id>();

const { t } = useI18n();

const { form, save, typeWrite, eventIdWrite, eventIdInput, onWindowClosed } =
	useCallEventCommandSchema({ controls: () => controls });

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

/** 窗口关闭时清理。 */
const onClosed = () => {
	onWindowClosed();
};

onMounted(() => {
	setupCallEventFields(controls, (key) => t(key));
});
</script>

<style>
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
