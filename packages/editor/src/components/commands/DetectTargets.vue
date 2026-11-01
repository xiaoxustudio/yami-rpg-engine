<template>
	<WindowFrame id="detectTargets" :ref="boxRef('detectTargets')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.detectTargets.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.detectTargets-actor.label') }}</div>
			<CustomBox
				id="detectTargets-actor"
				:ref="boxRef('detectTargets-actor')"
				v-tip="t('components.detectTargets-actor.tip')"
				v-focus
				type="actor"
				v-model="form.actor"
			/>
			<div class="text">{{ t('components.detectTargets-distance.label') }}</div>
			<NumberVar
				id="detectTargets-distance"
				:ref="boxRef('detectTargets-distance')"
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
				:label="t('components.detectTargets-selector.label')"
				id="detectTargets-selector"
				v-tip="t('components.detectTargets-selector.tip')"
				:ref="boxRef('detectTargets-selector')"
				v-model="form.selector"
			/>
			<div class="text">{{ t('components.detectTargets-inSight.label') }}</div>
			<SelectBox
				:label="t('components.detectTargets-inSight.label')"
				id="detectTargets-inSight"
				v-tip="t('components.detectTargets-inSight.tip')"
				:ref="boxRef('detectTargets-inSight')"
				v-model="form.inSight"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useLocalizedOptions } from '@app/composables/useLocalizedOptions';
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useDetectTargetsCommandSchema } from '@app/composables/commands/useDetectTargetsCommandSchema';
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

const { form, save } = useDetectTargetsCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	useLocalizedOptions(
		'detectTargets-selector',
		['enemy', 'friend', 'team', 'team-except-self', 'any-except-self', 'any'],
		(items) => boxes['detectTargets-selector']?.loadItems?.(items)
	);
	useLocalizedOptions('detectTargets-inSight', [true, false], (items) =>
		boxes['detectTargets-inSight']?.loadItems?.(items)
	);
});
</script>

<style>
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
