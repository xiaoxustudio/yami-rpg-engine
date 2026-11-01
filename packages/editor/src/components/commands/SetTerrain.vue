<template>
	<WindowFrame id="setTerrain" :ref="boxRef('setTerrain')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setTerrain.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.setTerrain-position.label') }}</div>
			<CustomBox
				id="setTerrain-position"
				:ref="boxRef('setTerrain-position')"
				v-tip="t('components.setTerrain-position.tip')"
				v-focus
				type="position"
				v-model="form.position"
			/>
			<div class="text">{{ t('components.setTerrain-terrain.label') }}</div>
			<SelectBox
				:label="t('components.setTerrain-terrain.label')"
				id="setTerrain-terrain"
				v-tip="t('components.setTerrain-terrain.tip')"
				:ref="boxRef('setTerrain-terrain')"
				v-model="form.terrain"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useLocalizedOptions } from '@app/composables/useLocalizedOptions';
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSetTerrainCommandSchema } from '@app/composables/commands/useSetTerrainCommandSchema';
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

const { form, save } = useSetTerrainCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	useLocalizedOptions('setTerrain-terrain', ['land', 'water', 'wall'], (items) =>
		boxes['setTerrain-terrain']?.loadItems?.(items)
	);
});
</script>

<style>
#setTerrain {
	width: 324px;
	height: 122px;
}

#setTerrain-confirm {
	right: 108px;
	bottom: 10px;
}

#setTerrain-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
