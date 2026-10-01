<template>
	<WindowFrame
		id="discardTargets"
		:ref="registryRef(fieldEls, 'discardTargets')"
		@confirm="onConfirm"
	>
		<template #title
			><TitleBar
				>{{ t('components.discardTargets.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.discardTargets-actor.label') }}</div>
			<CustomBox
				id="discardTargets-actor"
				:ref="registryRef(fieldEls, 'discardTargets-actor')"
				v-tip="t('components.discardTargets-actor.tip')"
				v-focus
				type="actor"
				v-model="form.actor"
			/>
			<div class="text">{{ t('components.discardTargets-selector.label') }}</div>
			<SelectBox
				:label="t('components.discardTargets-selector.label')"
				id="discardTargets-selector"
				v-tip="t('components.discardTargets-selector.tip')"
				:ref="registryRef(fieldEls, 'discardTargets-selector')"
				v-model="form.selector"
			/>
			<div class="text">{{ t('components.discardTargets-distance.label') }}</div>
			<NumberVar
				id="discardTargets-distance"
				:ref="registryRef(fieldEls, 'discardTargets-distance')"
				v-tip="t('components.discardTargets-distance.tip')"
				min="0"
				max="512"
				decimals="4"
				unit="tile"
				v-model="form.distance"
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
import { useDiscardTargetsCommandSchema } from '@app/composables/commands/useDiscardTargetsCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useDiscardTargetsCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	useLocalizedOptions(
		'discardTargets-selector',
		['enemy', 'friend', 'team', 'team-except-self', 'any-except-self', 'any'],
		(items) => fieldEls.get('discardTargets-selector')?.loadItems?.(items)
	);
});
</script>

<style>
/* 不能用 scoped：-confirm/-cancel 等元素由 WindowFrame 内部生成 */
#discardTargets {
	width: 324px;
	height: 146px;
}

#discardTargets-confirm {
	right: 108px;
	bottom: 10px;
}

#discardTargets-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
