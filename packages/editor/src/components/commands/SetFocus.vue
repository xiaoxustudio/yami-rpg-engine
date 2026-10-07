<template>
	<WindowFrame id="setFocus" :ref="registryRef(fieldEls, 'setFocus')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setFocus.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.setFocus-operation.label') }}</div>
			<SelectBox
				:label="t('components.setFocus-operation.label')"
				id="setFocus-operation"
				v-tip="t('components.setFocus-operation.tip')"
				:ref="registryRef(fieldEls, 'setFocus-operation')"
				v-focus
				v-model="form.operation"
			/>
			<div class="text">{{ t('components.setFocus-element.label') }}</div>
			<CustomBox
				id="setFocus-element"
				v-tip="t('components.setFocus-element.tip')"
				:ref="registryRef(fieldEls, 'setFocus-element')"
				type="element"
				v-model="form.element"
			/>
			<div class="text">{{ t('components.setFocus-mode.label') }}</div>
			<SelectBox
				:label="t('components.setFocus-mode.label')"
				id="setFocus-mode"
				v-tip="t('components.setFocus-mode.tip')"
				:ref="registryRef(fieldEls, 'setFocus-mode')"
				v-model="form.mode"
			/>
			<div class="text">{{ t('components.setFocus-cancelable.label') }}</div>
			<CheckBox
				id="setFocus-cancelable"
				v-tip="t('components.setFocus-cancelable.tip')"
				:ref="registryRef(fieldEls, 'setFocus-cancelable')"
				class="standard large"
				v-model="cancelable"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useLocalizedOptions } from '@app/composables/useLocalizedOptions';
import { createElementRegistry, registryRef } from '@app/utils/element-registry';
import { composableEls } from '@app/composables/element-registry';

const fieldEls = createElementRegistry(composableEls);
import { computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSetFocusCommandSchema } from '@app/composables/commands/useSetFocusCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CheckBox from '@app/components/common/CheckBox.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useSetFocusCommandSchema();

const cancelable = computed({
	get: () => form.cancelable as boolean,
	set: (value) => {
		form.cancelable = value;
	}
});

const onConfirm = () => {
	save();
};

onMounted(() => {
	useLocalizedOptions(
		'setFocus-operation',
		['add', 'remove', 'remove-latest', 'reset'],
		(items) => fieldEls.get('setFocus-operation')?.loadItems?.(items)
	);
	useLocalizedOptions(
		'setFocus-mode',
		['control-child-buttons', 'control-descendant-buttons'],
		(items) => fieldEls.get('setFocus-mode')?.loadItems?.(items)
	);
	fieldEls
		.get('setFocus-operation')
		?.enableHiddenMode?.()
		?.relate?.([
			{
				case: 'add',
				targets: [
					fieldEls.get('setFocus-element'),
					fieldEls.get('setFocus-mode'),
					fieldEls.get('setFocus-cancelable')
				]
			},
			{ case: 'remove', targets: [fieldEls.get('setFocus-element')] }
		]);
});
</script>

<style>
/* 不能用 scoped：-confirm/-cancel 等元素由 WindowFrame 内部生成 */
#setFocus {
	width: 324px;
	height: 170px;
}

#setFocus-confirm {
	right: 108px;
	bottom: 10px;
}

#setFocus-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
