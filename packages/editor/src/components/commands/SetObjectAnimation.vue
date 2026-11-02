<template>
	<WindowFrame
		id="setObjectAnimation"
		:ref="controlRef('setObjectAnimation')"
		@confirm="onConfirm"
		@open="onWindowOpen"
	>
		<template #title
			><TitleBar
				>{{ t('components.setObjectAnimation.title') }}
				<div class="close" /></TitleBar
		></template>

		<div
			class="grid-box"
			id="setObjectAnimation-grid-box"
			:ref="controlRef('setObjectAnimation-grid-box')"
		>
			<div class="text">{{ t('components.setObjectAnimation-sort.label') }}</div>
			<SelectBox
				:label="t('components.setObjectAnimation-sort.label')"
				id="setObjectAnimation-sort"
				v-tip="t('components.setObjectAnimation-sort.tip')"
				:ref="controlRef('setObjectAnimation-sort')"
				v-focus
				v-model="form.sort"
			/>
			<div class="text">{{ t('components.setObjectAnimation-actor.label') }}</div>
			<CustomBox
				id="setObjectAnimation-actor"
				v-tip="t('components.setObjectAnimation-actor.tip')"
				:ref="controlRef('setObjectAnimation-actor')"
				type="actor"
				v-model="form.actor"
			/>
			<div class="text">{{ t('components.setObjectAnimation-trigger.label') }}</div>
			<CustomBox
				id="setObjectAnimation-trigger"
				v-tip="t('components.setObjectAnimation-trigger.tip')"
				:ref="controlRef('setObjectAnimation-trigger')"
				type="trigger"
				v-model="form.trigger"
			/>
			<div class="text">{{ t('components.setObjectAnimation-animation.label') }}</div>
			<CustomBox
				id="setObjectAnimation-animation"
				v-tip="t('components.setObjectAnimation-animation.tip')"
				:ref="controlRef('setObjectAnimation-animation')"
				type="object"
				v-model="form.animation"
			/>
			<div class="text">{{ t('components.setObjectAnimation-operation.label') }}</div>
			<SelectBox
				:label="t('components.setObjectAnimation-operation.label')"
				id="setObjectAnimation-operation"
				v-tip="t('components.setObjectAnimation-operation.tip')"
				:ref="controlRef('setObjectAnimation-operation')"
				v-model="form.operation"
			/>
			<div class="text">{{ t('components.setObjectAnimation-tint-0.label') }}</div>
			<NumberBox
				:label="t('components.setObjectAnimation-tint-0.label')"
				id="setObjectAnimation-tint-0"
				v-tip="t('components.setObjectAnimation-tint-0.tip')"
				:ref="controlRef('setObjectAnimation-tint-0')"
				min="-255"
				max="255"
				step="5"
				v-model="tint0"
			/>
			<div class="text">{{ t('components.setObjectAnimation-tint-1.label') }}</div>
			<NumberBox
				:label="t('components.setObjectAnimation-tint-1.label')"
				id="setObjectAnimation-tint-1"
				v-tip="t('components.setObjectAnimation-tint-1.tip')"
				:ref="controlRef('setObjectAnimation-tint-1')"
				min="-255"
				max="255"
				step="5"
				v-model="tint1"
			/>
			<div class="text">{{ t('components.setObjectAnimation-tint-2.label') }}</div>
			<NumberBox
				:label="t('components.setObjectAnimation-tint-2.label')"
				id="setObjectAnimation-tint-2"
				v-tip="t('components.setObjectAnimation-tint-2.tip')"
				:ref="controlRef('setObjectAnimation-tint-2')"
				min="-255"
				max="255"
				step="5"
				v-model="tint2"
			/>
			<div class="text">{{ t('components.setObjectAnimation-tint-3.label') }}</div>
			<NumberBox
				:label="t('components.setObjectAnimation-tint-3.label')"
				id="setObjectAnimation-tint-3"
				v-tip="t('components.setObjectAnimation-tint-3.tip')"
				:ref="controlRef('setObjectAnimation-tint-3')"
				min="0"
				max="255"
				step="5"
				v-model="tint3"
			/>
			<div class="text">{{ t('components.setObjectAnimation-opacity.label') }}</div>
			<NumberVar
				id="setObjectAnimation-opacity"
				v-tip="t('components.setObjectAnimation-opacity.tip')"
				:ref="controlRef('setObjectAnimation-opacity')"
				min="0"
				max="1"
				step="0.1"
				decimals="4"
				v-model="form.opacity"
			/>
			<div class="text">{{ t('components.setObjectAnimation-offsetY.label') }}</div>
			<NumberVar
				id="setObjectAnimation-offsetY"
				v-tip="t('components.setObjectAnimation-offsetY.tip')"
				:ref="controlRef('setObjectAnimation-offsetY')"
				min="-10000"
				max="10000"
				step="1"
				decimals="4"
				v-model="form.offsetY"
			/>
			<div class="text">{{ t('components.setObjectAnimation-rotation.label') }}</div>
			<NumberVar
				id="setObjectAnimation-rotation"
				v-tip="t('components.setObjectAnimation-rotation.tip')"
				:ref="controlRef('setObjectAnimation-rotation')"
				min="-10000"
				max="10000"
				step="1"
				decimals="4"
				v-model="form.rotation"
			/>
			<div class="text">{{ t('components.setObjectAnimation-easingId.label') }}</div>
			<SelectBox
				:label="t('components.setObjectAnimation-easingId.label')"
				id="setObjectAnimation-easingId"
				:ref="controlRef('setObjectAnimation-easingId')"
				name="easing"
				v-model="form.easingId"
			/>
			<div class="text">{{ t('components.setObjectAnimation-duration.label') }}</div>
			<NumberBox
				:label="t('components.setObjectAnimation-duration.label')"
				id="setObjectAnimation-duration"
				:ref="controlRef('setObjectAnimation-duration')"
				name="duration"
				min="0"
				max="3600000"
				unit="ms"
				v-model="duration"
			/>
			<div class="text">{{ t('components.setObjectAnimation-wait.label') }}</div>
			<SelectBox
				:label="t('components.setObjectAnimation-wait.label')"
				id="setObjectAnimation-wait"
				:ref="controlRef('setObjectAnimation-wait')"
				name="wait"
				v-model="form.wait"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useLocalizedOptions } from '@app/composables/useLocalizedOptions';

import { computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSetObjectAnimationCommandSchema } from '@app/composables/commands/useSetObjectAnimationCommandSchema';
import { Data } from '@app/data/data-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import { controlRoot, useControlRefs } from '@app/composables/control-refs';

/** 控件 id 联合：模板与脚本共用，拼错在 tsc / vue-tsc 就红。 */
type Id =
	| 'setObjectAnimation'
	| 'setObjectAnimation-actor'
	| 'setObjectAnimation-animation'
	| 'setObjectAnimation-duration'
	| 'setObjectAnimation-easingId'
	| 'setObjectAnimation-grid-box'
	| 'setObjectAnimation-offsetY'
	| 'setObjectAnimation-opacity'
	| 'setObjectAnimation-operation'
	| 'setObjectAnimation-rotation'
	| 'setObjectAnimation-sort'
	| 'setObjectAnimation-tint-0'
	| 'setObjectAnimation-tint-1'
	| 'setObjectAnimation-tint-2'
	| 'setObjectAnimation-tint-3'
	| 'setObjectAnimation-trigger'
	| 'setObjectAnimation-wait';

const { controls, controlRef } = useControlRefs<Id>();

const { t } = useI18n();

const { form, save } = useSetObjectAnimationCommandSchema();

const tint0 = computed({
	get: () => form['tint-0'] as number | string,
	set: (value) => {
		form['tint-0'] = value;
	}
});

const tint1 = computed({
	get: () => form['tint-1'] as number | string,
	set: (value) => {
		form['tint-1'] = value;
	}
});

const tint2 = computed({
	get: () => form['tint-2'] as number | string,
	set: (value) => {
		form['tint-2'] = value;
	}
});

const tint3 = computed({
	get: () => form['tint-3'] as number | string,
	set: (value) => {
		form['tint-3'] = value;
	}
});

const duration = computed({
	get: () => form.duration as number | string,
	set: (value) => {
		form.duration = value;
	}
});

const onConfirm = () => {
	save();
};

/** 窗口打开时刷新候选项。 */
const onWindowOpen = () => {
	controls['setObjectAnimation-easingId']?.loadItems?.(Data.createEasingItems!());
};

onMounted(() => {
	useLocalizedOptions(
		'setObjectAnimation-sort',
		['actor', 'components', 'trigger', 'animation'],
		(items) => controls['setObjectAnimation-sort']?.loadItems?.(items)
	);
	controls['setObjectAnimation-sort']?.enableHiddenMode?.();
	controls['setObjectAnimation-sort']?.relate?.([
		{
			case: ['actor', 'components'],
			targets: [controlRoot(controls['setObjectAnimation-actor'])]
		},
		{
			case: 'trigger',
			targets: [controlRoot(controls['setObjectAnimation-trigger'])]
		},
		{
			case: 'animation',
			targets: [controlRoot(controls['setObjectAnimation-animation'])]
		}
	]);
	useLocalizedOptions(
		'setObjectAnimation-operation',
		['set-tint', 'set-rgb', 'set-gray', 'set-opacity', 'set-offsetY', 'set-rotation'],
		(items) => controls['setObjectAnimation-operation']?.loadItems?.(items)
	);
	controls['setObjectAnimation-operation']?.enableHiddenMode?.();
	controls['setObjectAnimation-operation']?.relate?.([
		{
			case: 'set-tint',
			targets: [
				controlRoot(controls['setObjectAnimation-tint-0']),
				controlRoot(controls['setObjectAnimation-tint-1']),
				controlRoot(controls['setObjectAnimation-tint-2']),
				controlRoot(controls['setObjectAnimation-tint-3'])
			]
		},
		{
			case: 'set-rgb',
			targets: [
				controlRoot(controls['setObjectAnimation-tint-0']),
				controlRoot(controls['setObjectAnimation-tint-1']),
				controlRoot(controls['setObjectAnimation-tint-2'])
			]
		},
		{
			case: 'set-gray',
			targets: [controlRoot(controls['setObjectAnimation-tint-3'])]
		},
		{
			case: 'set-opacity',
			targets: [controlRoot(controls['setObjectAnimation-opacity'])]
		},
		{
			case: 'set-offsetY',
			targets: [controlRoot(controls['setObjectAnimation-offsetY'])]
		},
		{
			case: 'set-rotation',
			targets: [controlRoot(controls['setObjectAnimation-rotation'])]
		}
	]);
	useLocalizedOptions('setObjectAnimation-wait', [true, false], (items) =>
		controls['setObjectAnimation-wait']?.loadItems?.(items)
	);
});
</script>

<style>
#setObjectAnimation {
	width: 324px;
	height: 314px;
}

#setObjectAnimation-grid-box {
	width: 304px;
}

#setObjectAnimation-confirm {
	right: 108px;
	bottom: 10px;
}

#setObjectAnimation-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
