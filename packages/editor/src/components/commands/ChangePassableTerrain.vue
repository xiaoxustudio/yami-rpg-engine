<template>
	<WindowFrame
		id="changePassableTerrain"
		:ref="boxRef('changePassableTerrain')"
		@confirm="onConfirm"
	>
		<template #title
			><TitleBar
				>{{ t('components.changePassableTerrain.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.changePassableTerrain-actor.label') }}</div>
			<CustomBox
				id="changePassableTerrain-actor"
				:ref="boxRef('changePassableTerrain-actor')"
				v-tip="t('components.changePassableTerrain-actor.tip')"
				v-focus
				type="actor"
				v-model="form.actor"
			/>
			<div class="text">{{ t('components.changePassableTerrain-passage.label') }}</div>
			<SelectBox
				:label="t('components.changePassableTerrain-passage.label')"
				id="changePassableTerrain-passage"
				v-tip="t('components.changePassableTerrain-passage.tip')"
				:ref="boxRef('changePassableTerrain-passage')"
				v-model="form.passage"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useLocalizedOptions } from '@app/composables/useLocalizedOptions';
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useChangePassableTerrainCommandSchema } from '@app/composables/commands/useChangePassableTerrainCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

// 控件用局部模板 ref 回调（存**元素**，relate/hide/show 需要 DOM 元素），不再进全局注册表。
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

const { form, save } = useChangePassableTerrainCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	useLocalizedOptions(
		'changePassableTerrain-passage',
		['land', 'water', 'unrestricted'],
		(items) => boxes['changePassableTerrain-passage']?.loadItems?.(items),
		{
			land: 'command.changePassableTerrain.land',
			water: 'command.changePassableTerrain.water',
			unrestricted: 'command.changePassableTerrain.unrestricted'
		}
	);
});
</script>

<style>
#changePassableTerrain {
	width: 324px;
	height: 122px;
}

#changePassableTerrain-confirm {
	right: 108px;
	bottom: 10px;
}

#changePassableTerrain-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
