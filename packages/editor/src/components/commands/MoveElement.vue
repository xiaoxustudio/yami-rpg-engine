<template>
	<WindowFrame
		id="moveElement"
		:ref="registryRef(fieldEls, 'moveElement')"
		@confirm="onConfirm"
		@open="onWindowOpen"
		@closed="onClosed"
	>
		<template #title
			><TitleBar
				>{{ t('components.moveElement.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.moveElement-element.label') }}</div>
			<CustomBox
				id="moveElement-element"
				:ref="registryRef(fieldEls, 'moveElement-element')"
				v-tip="t('components.moveElement-element.tip')"
				v-focus
				type="element"
				v-model="form.element"
			/>
			<div class="text">{{ t('components.moveElement-properties.label') }}</div>
			<ParamList
				id="moveElement-properties"
				:ref="registryRef(fieldEls, 'moveElement-properties')"
				v-focus
				v-model="form.properties"
			/>
			<div class="text">{{ t('components.moveElement-easingId.label') }}</div>
			<SelectBox
				:label="t('components.moveElement-easingId.label')"
				id="moveElement-easingId"
				:ref="registryRef(fieldEls, 'moveElement-easingId')"
				name="easing"
				v-model="form.easingId"
			/>
			<div class="text">{{ t('components.moveElement-duration.label') }}</div>
			<NumberBox
				:label="t('components.moveElement-duration.label')"
				id="moveElement-duration"
				:ref="registryRef(fieldEls, 'moveElement-duration')"
				name="duration"
				min="0"
				max="3600000"
				unit="ms"
				v-model="duration"
			/>
			<div class="text">{{ t('components.moveElement-wait.label') }}</div>
			<SelectBox
				:label="t('components.moveElement-wait.label')"
				id="moveElement-wait"
				:ref="registryRef(fieldEls, 'moveElement-wait')"
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
import { useMoveElementCommandSchema } from '@app/composables/commands/useMoveElementCommandSchema';
import { clear } from '@app/utils/element-utils';
import { TransformProperty } from '@app/commands/property-window/move-element-property-window.ts';
import { Data } from '@app/data/data-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import ParamList from '@app/components/common/ParamList.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useMoveElementCommandSchema();

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
	clear(fieldEls.get('moveElement-properties'));
};

/** 窗口打开时刷新候选项。 */
const onWindowOpen = () => {
	fieldEls.get('moveElement-easingId')?.loadItems?.(Data.createEasingItems!());
};

onMounted(() => {
	fieldEls.get('moveElement-properties')?.bind?.(TransformProperty);
	useLocalizedOptions('moveElement-wait', [true, false], (items) =>
		fieldEls.get('moveElement-wait')?.loadItems?.(items)
	);
});
</script>

<style>
#moveElement {
	width: 324px;
	height: 276px;
}

#moveElement-properties {
	height: 102px;
}

#moveElement-confirm {
	right: 108px;
	bottom: 10px;
}

#moveElement-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
