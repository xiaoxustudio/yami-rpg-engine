<template>
	<WindowFrame id="setAngle" :ref="boxRef('setAngle')" @confirm="onConfirm" @open="onWindowOpen">
		<template #title
			><TitleBar
				>{{ t('components.setAngle.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.setAngle-actor.label') }}</div>
			<CustomBox
				id="setAngle-actor"
				:ref="boxRef('setAngle-actor')"
				v-tip="t('components.setAngle-actor.tip')"
				v-focus
				type="actor"
				v-model="form.actor"
			/>
			<div class="text">{{ t('components.setAngle-angle.label') }}</div>
			<CustomBox
				id="setAngle-angle"
				:ref="boxRef('setAngle-angle')"
				v-tip="t('components.setAngle-angle.tip')"
				type="angle"
				v-model="form.angle"
			/>
			<div class="text">{{ t('components.setAngle-easingId.label') }}</div>
			<SelectBox
				:label="t('components.setAngle-easingId.label')"
				id="setAngle-easingId"
				:ref="boxRef('setAngle-easingId')"
				name="easing"
				v-model="form.easingId"
			/>
			<div class="text">{{ t('components.setAngle-duration.label') }}</div>
			<NumberVar
				id="setAngle-duration"
				:ref="boxRef('setAngle-duration')"
				name="duration"
				min="0"
				max="3600000"
				unit="ms"
				v-model="form.duration"
			/>
			<div class="text">{{ t('components.setAngle-wait.label') }}</div>
			<SelectBox
				:label="t('components.setAngle-wait.label')"
				id="setAngle-wait"
				:ref="boxRef('setAngle-wait')"
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
import { useSetAngleCommandSchema } from '@app/composables/commands/useSetAngleCommandSchema';
import { Data } from '@app/data/data-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

// 控件用局部模板 ref 回调（存**元素**：relate/hide/show 需要 DOM 元素），不再进全局注册表。
type ControlElement = HTMLElement & {
	loadItems?: (items: unknown[]) => unknown;
	bind?: (value: unknown) => unknown;
	write?: (value: unknown) => void;
	read?: () => unknown;
};
const boxes: Record<string, ControlElement | null> = {};
const boxRef = (id: string) => (el: unknown) => {
	if (el == null) {
		boxes[id] = null;
		return;
	}
	if (el instanceof HTMLElement) {
		boxes[id] = el as ControlElement;
		return;
	}
	const instance = el as { $el?: unknown; root?: unknown };
	const root = instance.$el ?? instance.root ?? null;
	boxes[id] = root instanceof HTMLElement ? (root as ControlElement) : null;
};

const { t } = useI18n();

const { form, save } = useSetAngleCommandSchema();

const onConfirm = () => {
	save();
};

/** 窗口打开时刷新候选项。 */
const onWindowOpen = () => {
	boxes['setAngle-easingId']?.loadItems?.(Data.createEasingItems!());
};

onMounted(() => {
	useLocalizedOptions('setAngle-wait', [true, false], (items) =>
		boxes['setAngle-wait']?.loadItems?.(items)
	);
});
</script>

<style>
#setAngle {
	width: 324px;
	height: 194px;
}

#setAngle-confirm {
	right: 108px;
	bottom: 10px;
}

#setAngle-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
