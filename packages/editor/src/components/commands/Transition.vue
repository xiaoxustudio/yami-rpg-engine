<template>
	<WindowFrame id="transition" :ref="controlRef('transition')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.transition.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.transition-variable.label') }}</div>
			<CustomBox
				id="transition-variable"
				:ref="controlRef('transition-variable')"
				v-tip="t('components.transition-variable.tip')"
				v-focus
				type="variable"
				filter="number"
				v-model="form.variable"
			/>
			<div class="text">{{ t('components.transition-start.label') }}</div>
			<NumberVar
				id="transition-start"
				:ref="controlRef('transition-start')"
				v-tip="t('components.transition-start.tip')"
				min="-1000000000"
				max="1000000000"
				decimals="10"
				v-model="form.start"
			/>
			<div class="text">{{ t('components.transition-end.label') }}</div>
			<NumberVar
				id="transition-end"
				:ref="controlRef('transition-end')"
				v-tip="t('components.transition-end.tip')"
				min="-1000000000"
				max="1000000000"
				decimals="10"
				v-model="form.end"
			/>
			<div class="text">{{ t('components.transition-easingId.label') }}</div>
			<SelectBox
				:label="t('components.transition-easingId.label')"
				id="transition-easingId"
				:ref="controlRef('transition-easingId')"
				name="easing"
				v-model="form.easingId"
			/>
			<div class="text">{{ t('components.transition-duration.label') }}</div>
			<NumberVar
				id="transition-duration"
				:ref="controlRef('transition-duration')"
				v-focus
				name="duration"
				min="0"
				max="3600000"
				unit="ms"
				v-model="form.duration"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { on } from '@app/utils/element-utils';
import { useTransitionCommandSchema } from '@app/composables/commands/useTransitionCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import { useControlRefs } from '@app/composables/control-refs';
import {
	provideTransitionBridge,
	resetTransitionBridge,
	type TransitionBridge
} from '@app/composables/transition-bridge';

/** 控件 id 联合：模板与脚本共用，拼错在 tsc / vue-tsc 就红。 */
type Id =
	| 'transition-duration'
	| 'transition-easingId'
	| 'transition-end'
	| 'transition-start'
	| 'transition-variable'
	| 'transition';

const { controls, controlRef } = useControlRefs<Id>();

const { t } = useI18n();

const { form, save, open, windowClosed } = useTransitionCommandSchema();

const onConfirm = () => {
	save();
};

/** 控件级能力：schema 要在打开/关闭窗口时灌候选项与清空，但不该知道控件 id。 */
const bridgeApi: TransitionBridge = {
	loadItems: (items) => {
		controls['transition-easingId']?.loadItems?.(items);
	},
	clear: () => {
		controls['transition-easingId']?.clear?.();
	}
};

onMounted(() => {
	provideTransitionBridge(bridgeApi);
	onUnmounted(() => resetTransitionBridge(bridgeApi));
	on(controls['transition'], 'open', () => open());
	on(controls['transition'], 'closed', () => windowClosed(new Event('closed')));
});
</script>

<style>
#transition {
	width: 324px;
	height: 194px;
}

#transition-confirm {
	right: 108px;
	bottom: 10px;
}

#transition-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
