<template>
	<WindowFrame
		id="detectTargets"
		:ref="registryRef(fieldEls, 'detectTargets')"
		@confirm="onConfirm"
	>
		<template #title
			><TitleBar
				>{{ t('components.detectTargets.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.detectTargets-actor.label') }}</div>
			<CustomBox
				id="detectTargets-actor"
				:ref="registryRef(fieldEls, 'detectTargets-actor')"
				v-tip="t('components.detectTargets-actor.tip')"
				v-focus
				type="actor"
				v-model="form.actor"
			/>
			<div class="text">{{ t('components.detectTargets-distance.label') }}</div>
			<NumberVar
				id="detectTargets-distance"
				:ref="registryRef(fieldEls, 'detectTargets-distance')"
				v-tip="t('components.detectTargets-distance.tip')"
				v-focus
				min="0"
				max="512"
				decimals="4"
				unit="tile"
				v-model="form.distance"
			/>
			<div class="text">{{ t('components.detectTargets-selector.label') }}</div>
			<SelectBox
				id="detectTargets-selector"
				v-tip="t('components.detectTargets-selector.tip')"
				:ref="registryRef(fieldEls, 'detectTargets-selector')"
				v-model="form.selector"
			/>
			<div class="text">{{ t('components.detectTargets-inSight.label') }}</div>
			<SelectBox
				id="detectTargets-inSight"
				v-tip="t('components.detectTargets-inSight.tip')"
				:ref="registryRef(fieldEls, 'detectTargets-inSight')"
				v-model="form.inSight"
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
import { useDetectTargetsCommandSchema } from '@app/composables/commands/useDetectTargetsCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useDetectTargetsCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	useLocalizedOptions(
		'detectTargets-selector',
		['enemy', 'friend', 'team', 'team-except-self', 'any-except-self', 'any'],
		(items) => fieldEls.get('detectTargets-selector')?.loadItems?.(items)
	);
	useLocalizedOptions('detectTargets-inSight', [true, false], (items) =>
		fieldEls.get('detectTargets-inSight')?.loadItems?.(items)
	);
});
</script>

<style>
/* 不能用 scoped：-confirm/-cancel 等元素由 WindowFrame 内部生成 */
#detectTargets {
	width: 324px;
	height: 170px;
}

#detectTargets-confirm {
	right: 108px;
	bottom: 10px;
}

#detectTargets-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
