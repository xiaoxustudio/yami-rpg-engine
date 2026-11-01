<template>
	<WindowFrame id="playActorAnimation" :ref="boxRef('playActorAnimation')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.playActorAnimation.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.playActorAnimation-actor.label') }}</div>
			<CustomBox
				id="playActorAnimation-actor"
				:ref="boxRef('playActorAnimation-actor')"
				v-tip="t('components.playActorAnimation-actor.tip')"
				v-focus
				type="actor"
				v-model="form.actor"
			/>
			<div class="text">{{ t('components.playActorAnimation-motion.label') }}</div>
			<CustomBox
				id="playActorAnimation-motion"
				:ref="boxRef('playActorAnimation-motion')"
				v-tip="t('components.playActorAnimation-motion.tip')"
				type="enum-string"
				v-model="form.motion"
			/>
			<div class="text">{{ t('components.playActorAnimation-speed.label') }}</div>
			<NumberVar
				id="playActorAnimation-speed"
				:ref="boxRef('playActorAnimation-speed')"
				v-tip="t('components.playActorAnimation-speed.tip')"
				min="0.1"
				max="10"
				step="0.1"
				decimals="4"
				v-model="form.speed"
			/>
			<div class="text">{{ t('components.playActorAnimation-wait.label') }}</div>
			<SelectBox
				:label="t('components.playActorAnimation-wait.label')"
				id="playActorAnimation-wait"
				:ref="boxRef('playActorAnimation-wait')"
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
import { usePlayActorAnimationCommandSchema } from '@app/composables/commands/usePlayActorAnimationCommandSchema';
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

const { form, save } = usePlayActorAnimationCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	useLocalizedOptions('playActorAnimation-wait', [true, false], (items) =>
		boxes['playActorAnimation-wait']?.loadItems?.(items)
	);
});
</script>

<style>
#playActorAnimation {
	width: 324px;
	height: 170px;
}

#playActorAnimation-confirm {
	right: 108px;
	bottom: 10px;
}

#playActorAnimation-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
