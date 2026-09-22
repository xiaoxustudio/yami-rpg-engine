<template>
	<WindowFrame
		id="registerEvent"
		:ref="registryRef(fieldEls, 'registerEvent')"
		@confirm="onConfirm"
	>
		<template #title
			><TitleBar
				>{{ t('components.registerEvent.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.registerEvent-target.label') }}</div>
			<SelectBox
				id="registerEvent-target"
				v-tip="t('components.registerEvent-target.tip')"
				:ref="registryRef(fieldEls, 'registerEvent-target')"
				v-focus
				v-model="form.target"
				@write="onTargetWrite"
			/>
			<div class="text">{{ t('components.registerEvent-actor.label') }}</div>
			<CustomBox
				id="registerEvent-actor"
				v-tip="t('components.registerEvent-actor.tip')"
				:ref="registryRef(fieldEls, 'registerEvent-actor')"
				type="actor"
				v-model="form.actor"
			/>
			<div class="text">{{ t('components.registerEvent-element.label') }}</div>
			<CustomBox
				id="registerEvent-element"
				v-tip="t('components.registerEvent-element.tip')"
				:ref="registryRef(fieldEls, 'registerEvent-element')"
				type="element"
				v-model="form.element"
			/>
			<div class="text">{{ t('components.registerEvent-operation.label') }}</div>
			<SelectBox
				id="registerEvent-operation"
				v-tip="t('components.registerEvent-operation.tip')"
				:ref="registryRef(fieldEls, 'registerEvent-operation')"
				v-model="form.operation"
				@write="onOperationWrite"
			/>
			<div class="text">{{ t('components.registerEvent-type.label') }}</div>
			<SelectBox
				id="registerEvent-type"
				:ref="registryRef(fieldEls, 'registerEvent-type')"
				v-tip="t('components.registerEvent-type.tip')"
				v-model="form.type"
				@write="onTypeWrite"
			/>
			<div class="text">{{ t('components.registerEvent-priority.label') }}</div>
			<CheckBox
				id="registerEvent-priority"
				:ref="registryRef(fieldEls, 'registerEvent-priority')"
				v-tip="t('components.registerEvent-priority.tip')"
				class="standard large"
				v-model="form.priority"
			/>
			<div class="text">{{ t('components.registerEvent-namespace.label') }}</div>
			<CheckBox
				id="registerEvent-namespace"
				:ref="registryRef(fieldEls, 'registerEvent-namespace')"
				v-tip="t('components.registerEvent-namespace.tip')"
				class="standard large"
				v-model="form.namespace"
			/>
			<div class="text">{{ t('components.registerEvent-tag.label') }}</div>
			<StringVar
				id="registerEvent-tag"
				:ref="registryRef(fieldEls, 'registerEvent-tag')"
				v-tip="t('components.registerEvent-tag.tip')"
				v-focus
				v-model="form.tag"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useLocalizedOptions } from '@app/composables/useLocalizedOptions';
import { createElementRegistry, registryRef } from '@app/utils/element-registry';
import { composableEls } from '@app/composables/element-registry';

// P5b 批次 4：本组件的控件元素注册表（替代按 id 查 DOM）
const fieldEls = createElementRegistry(composableEls);
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRegisterEventCommandSchema } from '@app/composables/commands/useRegisterEventCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CheckBox from '@app/components/common/CheckBox.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import StringVar from '@app/components/common/StringVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save, targetWrite, operationWrite, typeWrite } = useRegisterEventCommandSchema();

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
	useLocalizedOptions('registerEvent-target', ['global', 'actor', 'element'], (items) =>
		fieldEls.get('registerEvent-target')?.loadItems?.(items)
	);
	fieldEls
		.get('registerEvent-target')
		?.enableHiddenMode?.()
		?.relate?.([
			{ case: 'actor', targets: [fieldEls.get('registerEvent-actor')] },
			{ case: 'element', targets: [fieldEls.get('registerEvent-element')] }
		]);
	useLocalizedOptions(
		'registerEvent-operation',
		['register', 'unregister', 'reset'],
		(items) => fieldEls.get('registerEvent-operation')?.loadItems?.(items),
		{
			register: 'command.registerEvent.alias.register',
			unregister: 'command.registerEvent.alias.unregister',
			reset: 'command.registerEvent.alias.reset'
		}
	);
});
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
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
