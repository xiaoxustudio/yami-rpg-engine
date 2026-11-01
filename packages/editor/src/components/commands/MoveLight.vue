<template>
	<WindowFrame
		id="moveLight"
		:ref="boxRef('moveLight')"
		@confirm="onConfirm"
		@open="onWindowOpen"
		@closed="onClosed"
	>
		<template #title
			><TitleBar
				>{{ t('components.moveLight.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.moveLight-light.label') }}</div>
			<CustomBox
				id="moveLight-light"
				:ref="boxRef('moveLight-light')"
				v-focus
				type="light"
				v-model="form.light"
			/>
			<div class="text">{{ t('components.moveLight-properties.label') }}</div>
			<ParamList
				id="moveLight-properties"
				:ref="boxRef('moveLight-properties')"
				v-focus
				v-model="form.properties"
			/>
			<div class="text">{{ t('components.moveLight-easingId.label') }}</div>
			<SelectBox
				:label="t('components.moveLight-easingId.label')"
				id="moveLight-easingId"
				:ref="boxRef('moveLight-easingId')"
				name="easing"
				v-model="form.easingId"
			/>
			<div class="text">{{ t('components.moveLight-duration.label') }}</div>
			<NumberBox
				:label="t('components.moveLight-duration.label')"
				id="moveLight-duration"
				:ref="boxRef('moveLight-duration')"
				name="duration"
				min="0"
				max="3600000"
				unit="ms"
				v-model="duration"
			/>
			<div class="text">{{ t('components.moveLight-wait.label') }}</div>
			<SelectBox
				:label="t('components.moveLight-wait.label')"
				id="moveLight-wait"
				:ref="boxRef('moveLight-wait')"
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
import { useMoveLightCommandSchema } from '@app/composables/commands/useMoveLightCommandSchema';
import { clear } from '@app/utils/element-utils';
import { LightProperty } from '@app/commands/property-window/move-light-property-window.ts';
import { Data } from '@app/data/data-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import ParamList from '@app/components/common/ParamList.vue';
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

const { form, save } = useMoveLightCommandSchema();

const duration = computed({
	get: () => form.duration as number | string,
	set: (value) => {
		form.duration = value;
	}
});

const onConfirm = () => {
	save();
};

/** 窗口关闭时清理。 */
const onClosed = () => {
	clear(boxes['moveLight-properties']);
};

/** 窗口打开时刷新候选项。 */
const onWindowOpen = () => {
	boxes['moveLight-easingId']?.loadItems?.(Data.createEasingItems!());
};

onMounted(() => {
	boxes['moveLight-properties']?.bind?.(LightProperty);
	useLocalizedOptions('moveLight-wait', [true, false], (items) =>
		boxes['moveLight-wait']?.loadItems?.(items)
	);
});
</script>

<style>
#moveLight {
	width: 324px;
	height: 276px;
}

#moveLight-properties {
	height: 102px;
}

#moveLight-confirm {
	right: 108px;
	bottom: 10px;
}

#moveLight-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
