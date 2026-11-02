<template>
	<WindowFrame
		id="setGameSpeed"
		:ref="controlRef('setGameSpeed')"
		@confirm="onConfirm"
		@open="onWindowOpen"
	>
		<template #title
			><TitleBar
				>{{ t('components.setGameSpeed.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.setGameSpeed-speed.label') }}</div>
			<NumberVar
				id="setGameSpeed-speed"
				:ref="controlRef('setGameSpeed-speed')"
				v-tip="t('components.setGameSpeed-speed.tip')"
				v-focus
				min="0"
				max="10"
				step="0.1"
				decimals="4"
				v-model="form.speed"
			/>
			<div class="text">{{ t('components.setGameSpeed-easingId.label') }}</div>
			<SelectBox
				:label="t('components.setGameSpeed-easingId.label')"
				id="setGameSpeed-easingId"
				:ref="controlRef('setGameSpeed-easingId')"
				name="easing"
				v-model="form.easingId"
			/>
			<div class="text">{{ t('components.setGameSpeed-duration.label') }}</div>
			<NumberVar
				id="setGameSpeed-duration"
				:ref="controlRef('setGameSpeed-duration')"
				name="duration"
				min="0"
				max="3600000"
				unit="ms"
				v-model="form.duration"
			/>
			<div class="text">{{ t('components.setGameSpeed-wait.label') }}</div>
			<SelectBox
				:label="t('components.setGameSpeed-wait.label')"
				id="setGameSpeed-wait"
				:ref="controlRef('setGameSpeed-wait')"
				name="wait"
				v-model="form.wait"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useLocalizedOptions } from '@app/composables/useLocalizedOptions';
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSetGameSpeedCommandSchema } from '@app/composables/commands/useSetGameSpeedCommandSchema';
import { Data } from '@app/data/data-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import { useControlRefs } from '@app/composables/control-refs';

/** 控件 id 联合：模板与脚本共用，拼错在 tsc / vue-tsc 就红。 */
type Id =
	| 'setGameSpeed'
	| 'setGameSpeed-duration'
	| 'setGameSpeed-easingId'
	| 'setGameSpeed-speed'
	| 'setGameSpeed-wait';

const { controls, controlRef } = useControlRefs<Id>();

const { t } = useI18n();

const { form, save } = useSetGameSpeedCommandSchema();

const onConfirm = () => {
	save();
};

/** 窗口打开时刷新候选项。 */
const onWindowOpen = () => {
	controls['setGameSpeed-easingId']?.loadItems?.(Data.createEasingItems!());
};

onMounted(() => {
	useLocalizedOptions('setGameSpeed-wait', [true, false], (items) =>
		controls['setGameSpeed-wait']?.loadItems?.(items)
	);
});
</script>

<style>
#setGameSpeed {
	width: 324px;
	height: 170px;
}

#setGameSpeed-confirm {
	right: 108px;
	bottom: 10px;
}

#setGameSpeed-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
