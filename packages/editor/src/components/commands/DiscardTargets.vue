<template>
	<WindowFrame id="discardTargets" :ref="boxRef('discardTargets')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.discardTargets.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.discardTargets-actor.label') }}</div>
			<CustomBox
				id="discardTargets-actor"
				:ref="boxRef('discardTargets-actor')"
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
				:ref="boxRef('discardTargets-selector')"
				v-model="form.selector"
			/>
			<div class="text">{{ t('components.discardTargets-distance.label') }}</div>
			<NumberVar
				id="discardTargets-distance"
				:ref="boxRef('discardTargets-distance')"
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
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useDiscardTargetsCommandSchema } from '@app/composables/commands/useDiscardTargetsCommandSchema';
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

const { form, save } = useDiscardTargetsCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	useLocalizedOptions(
		'discardTargets-selector',
		['enemy', 'friend', 'team', 'team-except-self', 'any-except-self', 'any'],
		(items) => boxes['discardTargets-selector']?.loadItems?.(items)
	);
});
</script>

<style>
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
