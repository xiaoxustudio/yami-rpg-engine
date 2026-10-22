<template>
	<WindowFrame
		id="setObjectAnimation"
		:ref="registryRef(fieldEls, 'setObjectAnimation')"
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
			:ref="registryRef(fieldEls, 'setObjectAnimation-grid-box')"
		>
			<div class="text">{{ t('components.setObjectAnimation-sort.label') }}</div>
			<SelectBox
				:label="t('components.setObjectAnimation-sort.label')"
				id="setObjectAnimation-sort"
				v-tip="t('components.setObjectAnimation-sort.tip')"
				:ref="registryRef(fieldEls, 'setObjectAnimation-sort')"
				v-focus
				v-model="form.sort"
			/>
			<div class="text">{{ t('components.setObjectAnimation-actor.label') }}</div>
			<CustomBox
				id="setObjectAnimation-actor"
				v-tip="t('components.setObjectAnimation-actor.tip')"
				:ref="registryRef(fieldEls, 'setObjectAnimation-actor')"
				type="actor"
				v-model="form.actor"
			/>
			<div class="text">{{ t('components.setObjectAnimation-trigger.label') }}</div>
			<CustomBox
				id="setObjectAnimation-trigger"
				v-tip="t('components.setObjectAnimation-trigger.tip')"
				:ref="registryRef(fieldEls, 'setObjectAnimation-trigger')"
				type="trigger"
				v-model="form.trigger"
			/>
			<div class="text">{{ t('components.setObjectAnimation-animation.label') }}</div>
			<CustomBox
				id="setObjectAnimation-animation"
				v-tip="t('components.setObjectAnimation-animation.tip')"
				:ref="registryRef(fieldEls, 'setObjectAnimation-animation')"
				type="object"
				v-model="form.animation"
			/>
			<div class="text">{{ t('components.setObjectAnimation-operation.label') }}</div>
			<SelectBox
				:label="t('components.setObjectAnimation-operation.label')"
				id="setObjectAnimation-operation"
				v-tip="t('components.setObjectAnimation-operation.tip')"
				:ref="registryRef(fieldEls, 'setObjectAnimation-operation')"
				v-model="form.operation"
			/>
			<div class="text">{{ t('components.setObjectAnimation-tint-0.label') }}</div>
			<NumberBox
				:label="t('components.setObjectAnimation-tint-0.label')"
				id="setObjectAnimation-tint-0"
				v-tip="t('components.setObjectAnimation-tint-0.tip')"
				:ref="registryRef(fieldEls, 'setObjectAnimation-tint-0')"
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
				:ref="registryRef(fieldEls, 'setObjectAnimation-tint-1')"
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
				:ref="registryRef(fieldEls, 'setObjectAnimation-tint-2')"
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
				:ref="registryRef(fieldEls, 'setObjectAnimation-tint-3')"
				min="0"
				max="255"
				step="5"
				v-model="tint3"
			/>
			<div class="text">{{ t('components.setObjectAnimation-opacity.label') }}</div>
			<NumberVar
				id="setObjectAnimation-opacity"
				v-tip="t('components.setObjectAnimation-opacity.tip')"
				:ref="registryRef(fieldEls, 'setObjectAnimation-opacity')"
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
				:ref="registryRef(fieldEls, 'setObjectAnimation-offsetY')"
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
				:ref="registryRef(fieldEls, 'setObjectAnimation-rotation')"
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
				:ref="registryRef(fieldEls, 'setObjectAnimation-easingId')"
				name="easing"
				v-model="form.easingId"
			/>
			<div class="text">{{ t('components.setObjectAnimation-duration.label') }}</div>
			<NumberBox
				:label="t('components.setObjectAnimation-duration.label')"
				id="setObjectAnimation-duration"
				:ref="registryRef(fieldEls, 'setObjectAnimation-duration')"
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
				:ref="registryRef(fieldEls, 'setObjectAnimation-wait')"
				name="wait"
				v-model="form.wait"
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
import { useSetObjectAnimationCommandSchema } from '@app/composables/commands/useSetObjectAnimationCommandSchema';
import { Data } from '@app/data/data-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

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
	fieldEls.get('setObjectAnimation-easingId')?.loadItems?.(Data.createEasingItems!());
};

onMounted(() => {
	useLocalizedOptions(
		'setObjectAnimation-sort',
		['actor', 'components', 'trigger', 'animation'],
		(items) => fieldEls.get('setObjectAnimation-sort')?.loadItems?.(items)
	);
	fieldEls
		.get('setObjectAnimation-sort')
		?.enableHiddenMode?.()
		?.relate?.([
			{
				case: ['actor', 'components'],
				targets: [fieldEls.get('setObjectAnimation-actor')]
			},
			{
				case: 'trigger',
				targets: [fieldEls.get('setObjectAnimation-trigger')]
			},
			{
				case: 'animation',
				targets: [fieldEls.get('setObjectAnimation-animation')]
			}
		]);
	useLocalizedOptions(
		'setObjectAnimation-operation',
		['set-tint', 'set-rgb', 'set-gray', 'set-opacity', 'set-offsetY', 'set-rotation'],
		(items) => fieldEls.get('setObjectAnimation-operation')?.loadItems?.(items)
	);
	fieldEls
		.get('setObjectAnimation-operation')
		?.enableHiddenMode?.()
		?.relate?.([
			{
				case: 'set-tint',
				targets: [
					fieldEls.get('setObjectAnimation-tint-0'),
					fieldEls.get('setObjectAnimation-tint-1'),
					fieldEls.get('setObjectAnimation-tint-2'),
					fieldEls.get('setObjectAnimation-tint-3')
				]
			},
			{
				case: 'set-rgb',
				targets: [
					fieldEls.get('setObjectAnimation-tint-0'),
					fieldEls.get('setObjectAnimation-tint-1'),
					fieldEls.get('setObjectAnimation-tint-2')
				]
			},
			{
				case: 'set-gray',
				targets: [fieldEls.get('setObjectAnimation-tint-3')]
			},
			{
				case: 'set-opacity',
				targets: [fieldEls.get('setObjectAnimation-opacity')]
			},
			{
				case: 'set-offsetY',
				targets: [fieldEls.get('setObjectAnimation-offsetY')]
			},
			{
				case: 'set-rotation',
				targets: [fieldEls.get('setObjectAnimation-rotation')]
			}
		]);
	useLocalizedOptions('setObjectAnimation-wait', [true, false], (items) =>
		fieldEls.get('setObjectAnimation-wait')?.loadItems?.(items)
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
