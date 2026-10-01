<template>
	<WindowFrame id="getTarget" :ref="registryRef(fieldEls, 'getTarget')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.getTarget.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.getTarget-actor.label') }}</div>
			<CustomBox
				id="getTarget-actor"
				:ref="registryRef(fieldEls, 'getTarget-actor')"
				v-tip="t('components.getTarget-actor.tip')"
				v-focus
				type="actor"
				v-model="form.actor"
			/>
			<div class="text">{{ t('components.getTarget-selector.label') }}</div>
			<SelectBox
				:label="t('components.getTarget-selector.label')"
				id="getTarget-selector"
				v-tip="t('components.getTarget-selector.tip')"
				:ref="registryRef(fieldEls, 'getTarget-selector')"
				v-model="form.selector"
			/>
			<div class="text">{{ t('components.getTarget-condition.label') }}</div>
			<SelectBox
				:label="t('components.getTarget-condition.label')"
				id="getTarget-condition"
				v-tip="t('components.getTarget-condition.tip')"
				:ref="registryRef(fieldEls, 'getTarget-condition')"
				v-model="form.condition"
			/>
			<div class="text">{{ t('components.getTarget-attribute.label') }}</div>
			<SelectBox
				:label="t('components.getTarget-attribute.label')"
				id="getTarget-attribute"
				v-tip="t('components.getTarget-attribute.tip')"
				:ref="registryRef(fieldEls, 'getTarget-attribute')"
				v-focus
				v-model="form.attribute"
			/>
			<div class="text">{{ t('components.getTarget-divisor.label') }}</div>
			<SelectBox
				:label="t('components.getTarget-divisor.label')"
				id="getTarget-divisor"
				v-tip="t('components.getTarget-divisor.tip')"
				:ref="registryRef(fieldEls, 'getTarget-divisor')"
				v-focus
				v-model="form.divisor"
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
import { useGetTargetCommandSchema } from '@app/composables/commands/useGetTargetCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useGetTargetCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	useLocalizedOptions(
		'getTarget-selector',
		['enemy', 'friend', 'team', 'team-except-self', 'any-except-self', 'any'],
		(items) => fieldEls.get('getTarget-selector')?.loadItems?.(items)
	);
	useLocalizedOptions(
		'getTarget-condition',
		[
			'max-threat',
			'nearest',
			'farthest',
			'min-attribute-value',
			'max-attribute-value',
			'min-attribute-ratio',
			'max-attribute-ratio',
			'random'
		],
		(items) => fieldEls.get('getTarget-condition')?.loadItems?.(items),
		{
			'max-threat': 'command.getTarget.condition.max-threat',
			nearest: 'command.getTarget.condition.nearest',
			farthest: 'command.getTarget.condition.farthest',
			'min-attribute-value': 'command.getTarget.condition.min-attribute-value',
			'max-attribute-value': 'command.getTarget.condition.max-attribute-value',
			'min-attribute-ratio': 'command.getTarget.condition.min-attribute-ratio',
			'max-attribute-ratio': 'command.getTarget.condition.max-attribute-ratio',
			random: 'command.getTarget.condition.random'
		}
	);
	fieldEls
		.get('getTarget-condition')
		?.enableHiddenMode?.()
		?.relate?.([
			{
				case: ['min-attribute-value', 'max-attribute-value'],
				targets: [fieldEls.get('getTarget-attribute')]
			},
			{
				case: ['min-attribute-ratio', 'max-attribute-ratio'],
				targets: [fieldEls.get('getTarget-attribute'), fieldEls.get('getTarget-divisor')]
			}
		]);
});
</script>

<style>
/* 不能用 scoped：-confirm/-cancel 等元素由 WindowFrame 内部生成 */
#getTarget {
	width: 324px;
	height: 194px;
}

#getTarget-confirm {
	right: 108px;
	bottom: 10px;
}

#getTarget-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
