<template>
	<WindowFrame id="registerEvent" :ref="controlRef('registerEvent')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.registerEvent.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.registerEvent-target.label') }}</div>
			<SelectBox
				:label="t('components.registerEvent-target.label')"
				id="registerEvent-target"
				v-tip="t('components.registerEvent-target.tip')"
				:ref="controlRef('registerEvent-target')"
				v-focus
				v-model="form.target"
				@write="onTargetWrite"
			/>
			<div class="text">{{ t('components.registerEvent-actor.label') }}</div>
			<CustomBox
				id="registerEvent-actor"
				v-tip="t('components.registerEvent-actor.tip')"
				:ref="controlRef('registerEvent-actor')"
				type="actor"
				v-model="form.actor"
			/>
			<div class="text">{{ t('components.registerEvent-element.label') }}</div>
			<CustomBox
				id="registerEvent-element"
				v-tip="t('components.registerEvent-element.tip')"
				:ref="controlRef('registerEvent-element')"
				type="element"
				v-model="form.element"
			/>
			<div class="text">{{ t('components.registerEvent-operation.label') }}</div>
			<SelectBox
				:label="t('components.registerEvent-operation.label')"
				id="registerEvent-operation"
				v-tip="t('components.registerEvent-operation.tip')"
				:ref="controlRef('registerEvent-operation')"
				v-model="form.operation"
				@write="onOperationWrite"
			/>
			<div class="text">{{ t('components.registerEvent-type.label') }}</div>
			<SelectBox
				:label="t('components.registerEvent-type.label')"
				id="registerEvent-type"
				:ref="controlRef('registerEvent-type')"
				v-tip="t('components.registerEvent-type.tip')"
				v-model="form.type"
				@write="onTypeWrite"
			/>
			<div class="text">{{ t('components.registerEvent-priority.label') }}</div>
			<CheckBox
				id="registerEvent-priority"
				:ref="controlRef('registerEvent-priority')"
				v-tip="t('components.registerEvent-priority.tip')"
				class="standard large"
				v-model="form.priority"
			/>
			<div class="text">{{ t('components.registerEvent-namespace.label') }}</div>
			<CheckBox
				id="registerEvent-namespace"
				:ref="controlRef('registerEvent-namespace')"
				v-tip="t('components.registerEvent-namespace.tip')"
				class="standard large"
				v-model="form.namespace"
			/>
			<div class="text">{{ t('components.registerEvent-tag.label') }}</div>
			<StringVar
				id="registerEvent-tag"
				:ref="controlRef('registerEvent-tag')"
				v-tip="t('components.registerEvent-tag.tip')"
				v-focus
				v-model="form.tag"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { setupRegisterEventFields } from '@app/composables/useRegisterEventFields';

import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRegisterEventCommandSchema } from '@app/composables/commands/useRegisterEventCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CheckBox from '@app/components/common/CheckBox.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import StringVar from '@app/components/common/StringVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import { useControlRefs } from '@app/composables/control-refs';

/** 控件 id 联合：模板与脚本共用，拼错在 tsc / vue-tsc 就红。 */
type Id =
	| 'registerEvent'
	| 'registerEvent-actor'
	| 'registerEvent-element'
	| 'registerEvent-namespace'
	| 'registerEvent-operation'
	| 'registerEvent-priority'
	| 'registerEvent-tag'
	| 'registerEvent-target'
	| 'registerEvent-type';

const { controls, controlRef } = useControlRefs<Id>();

const { t } = useI18n();

const { form, save, targetWrite, operationWrite, typeWrite } = useRegisterEventCommandSchema({
	controls: () => controls
});

const onTargetWrite = (value: unknown) => {
	targetWrite?.({ value: value as string });
};
const onOperationWrite = () => {
	operationWrite?.();
};
const onTypeWrite = () => {
	typeWrite?.();
};

const onConfirm = () => {
	save();
};

onMounted(() => {
	setupRegisterEventFields(controls);
});
</script>

<style>
#registerEvent {
	width: 324px;
	height: 212px;
}

#registerEvent-confirm {
	right: 108px;
	bottom: 10px;
}

#registerEvent-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
