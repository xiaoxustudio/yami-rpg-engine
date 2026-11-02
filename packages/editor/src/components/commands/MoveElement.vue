<template>
	<WindowFrame
		id="moveElement"
		:ref="controlRef('moveElement')"
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
				:ref="controlRef('moveElement-element')"
				v-tip="t('components.moveElement-element.tip')"
				v-focus
				type="element"
				v-model="form.element"
			/>
			<div class="text">{{ t('components.moveElement-properties.label') }}</div>
			<ParamList
				id="moveElement-properties"
				:ref="controlRef('moveElement-properties')"
				v-focus
				v-model="form.properties"
			/>
			<div class="text">{{ t('components.moveElement-easingId.label') }}</div>
			<SelectBox
				:label="t('components.moveElement-easingId.label')"
				id="moveElement-easingId"
				:ref="controlRef('moveElement-easingId')"
				name="easing"
				v-model="form.easingId"
			/>
			<div class="text">{{ t('components.moveElement-duration.label') }}</div>
			<NumberBox
				:label="t('components.moveElement-duration.label')"
				id="moveElement-duration"
				:ref="controlRef('moveElement-duration')"
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
				:ref="controlRef('moveElement-wait')"
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
import { controlRoot, useControlRefs } from '@app/composables/control-refs';

/** 控件 id 联合：模板与脚本共用，拼错在 tsc / vue-tsc 就红。 */
type Id =
	| 'moveElement'
	| 'moveElement-duration'
	| 'moveElement-easingId'
	| 'moveElement-element'
	| 'moveElement-properties'
	| 'moveElement-wait';

const { controls, controlRef } = useControlRefs<Id>();

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
	clear(controlRoot(controls['moveElement-properties']));
};

/** 窗口打开时刷新候选项。 */
const onWindowOpen = () => {
	controls['moveElement-easingId']?.loadItems?.(Data.createEasingItems!());
};

onMounted(() => {
	controls['moveElement-properties']?.bind?.(TransformProperty);
	useLocalizedOptions('moveElement-wait', [true, false], (items) =>
		controls['moveElement-wait']?.loadItems?.(items)
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
