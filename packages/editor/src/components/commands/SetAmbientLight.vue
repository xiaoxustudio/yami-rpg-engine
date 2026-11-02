<template>
	<WindowFrame
		id="setAmbientLight"
		:ref="controlRef('setAmbientLight')"
		@confirm="onConfirm"
		@open="onWindowOpen"
	>
		<template #title
			><TitleBar
				>{{ t('components.setAmbientLight.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.setAmbientLight-red.label') }}</div>
			<NumberVar
				id="setAmbientLight-red"
				:ref="controlRef('setAmbientLight-red')"
				v-tip="t('components.setAmbientLight-red.tip')"
				v-focus
				min="0"
				max="255"
				step="5"
				v-model="form.red"
			/>
			<div class="text">{{ t('components.setAmbientLight-green.label') }}</div>
			<NumberVar
				id="setAmbientLight-green"
				:ref="controlRef('setAmbientLight-green')"
				v-tip="t('components.setAmbientLight-green.tip')"
				min="0"
				max="255"
				step="5"
				v-model="form.green"
			/>
			<div class="text">{{ t('components.setAmbientLight-blue.label') }}</div>
			<NumberVar
				id="setAmbientLight-blue"
				:ref="controlRef('setAmbientLight-blue')"
				v-tip="t('components.setAmbientLight-blue.tip')"
				min="0"
				max="255"
				step="5"
				v-model="form.blue"
			/>
			<div class="text">{{ t('components.setAmbientLight-easingId.label') }}</div>
			<SelectBox
				:label="t('components.setAmbientLight-easingId.label')"
				id="setAmbientLight-easingId"
				:ref="controlRef('setAmbientLight-easingId')"
				name="easing"
				v-model="form.easingId"
			/>
			<div class="text">{{ t('components.setAmbientLight-duration.label') }}</div>
			<NumberVar
				id="setAmbientLight-duration"
				:ref="controlRef('setAmbientLight-duration')"
				name="duration"
				min="0"
				max="3600000"
				unit="ms"
				v-model="form.duration"
			/>
			<div class="text">{{ t('components.setAmbientLight-wait.label') }}</div>
			<SelectBox
				:label="t('components.setAmbientLight-wait.label')"
				id="setAmbientLight-wait"
				:ref="controlRef('setAmbientLight-wait')"
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
import { useSetAmbientLightCommandSchema } from '@app/composables/commands/useSetAmbientLightCommandSchema';
import { Data } from '@app/data/data-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import { useControlRefs } from '@app/composables/control-refs';

/** 控件 id 联合：模板与脚本共用，拼错在 tsc / vue-tsc 就红。 */
type Id =
	| 'setAmbientLight'
	| 'setAmbientLight-blue'
	| 'setAmbientLight-duration'
	| 'setAmbientLight-easingId'
	| 'setAmbientLight-green'
	| 'setAmbientLight-red'
	| 'setAmbientLight-wait';

const { controls, controlRef } = useControlRefs<Id>();

const { t } = useI18n();

const { form, save } = useSetAmbientLightCommandSchema();

const onConfirm = () => {
	save();
};

/** 窗口打开时刷新候选项。 */
const onWindowOpen = () => {
	controls['setAmbientLight-easingId']?.loadItems?.(Data.createEasingItems!());
};

onMounted(() => {
	useLocalizedOptions('setAmbientLight-wait', [true, false], (items) =>
		controls['setAmbientLight-wait']?.loadItems?.(items)
	);
});
</script>

<style>
#setAmbientLight {
	width: 324px;
	height: 218px;
}

#setAmbientLight-filter {
	position: absolute;
	left: 318px;
	top: 10px;
	width: 100px;
	height: 164px;
}

#setAmbientLight-confirm {
	right: 108px;
	bottom: 10px;
}

#setAmbientLight-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
