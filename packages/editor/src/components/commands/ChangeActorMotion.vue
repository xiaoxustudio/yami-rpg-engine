<template>
	<WindowFrame id="changeActorMotion" :ref="boxRef('changeActorMotion')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.changeActorMotion.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.changeActorMotion-actor.label') }}</div>
			<CustomBox
				id="changeActorMotion-actor"
				:ref="boxRef('changeActorMotion-actor')"
				v-tip="t('components.changeActorMotion-actor.tip')"
				v-focus
				type="actor"
				v-model="form.actor"
			/>
			<div class="text">{{ t('components.changeActorMotion-type.label') }}</div>
			<SelectBox
				:label="t('components.changeActorMotion-type.label')"
				id="changeActorMotion-type"
				v-tip="t('components.changeActorMotion-type.tip')"
				:ref="boxRef('changeActorMotion-type')"
				v-model="form.type"
			/>
			<div class="text">{{ t('components.changeActorMotion-motion.label') }}</div>
			<CustomBox
				id="changeActorMotion-motion"
				:ref="boxRef('changeActorMotion-motion')"
				v-tip="t('components.changeActorMotion-motion.tip')"
				type="enum-string"
				v-model="form.motion"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useLocalizedOptions } from '@app/composables/useLocalizedOptions';
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useChangeActorMotionCommandSchema } from '@app/composables/commands/useChangeActorMotionCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
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

const { form, save } = useChangeActorMotionCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	useLocalizedOptions(
		'changeActorMotion-type',
		['idle', 'move'],
		(items) => boxes['changeActorMotion-type']?.loadItems?.(items),
		{ idle: 'command.changeActorMotion.type.idle', move: 'command.changeActorMotion.type.move' }
	);
});
</script>

<style>
#changeActorMotion {
	width: 324px;
	height: 146px;
}

#changeActorMotion-confirm {
	right: 108px;
	bottom: 10px;
}

#changeActorMotion-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
