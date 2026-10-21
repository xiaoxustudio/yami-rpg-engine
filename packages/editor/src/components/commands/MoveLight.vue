<template>
	<WindowFrame
		id="moveLight"
		:ref="registryRef(fieldEls, 'moveLight')"
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
				:ref="registryRef(fieldEls, 'moveLight-light')"
				v-focus
				type="light"
				v-model="form.light"
			/>
			<div class="text">{{ t('components.moveLight-properties.label') }}</div>
			<ParamList
				id="moveLight-properties"
				:ref="registryRef(fieldEls, 'moveLight-properties')"
				v-focus
				v-model="form.properties"
			/>
			<div class="text">{{ t('components.moveLight-easingId.label') }}</div>
			<SelectBox
				:label="t('components.moveLight-easingId.label')"
				id="moveLight-easingId"
				:ref="registryRef(fieldEls, 'moveLight-easingId')"
				name="easing"
				v-model="form.easingId"
			/>
			<div class="text">{{ t('components.moveLight-duration.label') }}</div>
			<NumberBox
				:label="t('components.moveLight-duration.label')"
				id="moveLight-duration"
				:ref="registryRef(fieldEls, 'moveLight-duration')"
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
				:ref="registryRef(fieldEls, 'moveLight-wait')"
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

/** 窗口关闭时清理。原先是元素优先 API（经 fieldEls 取到元素后订阅 closed）。 */
const onClosed = () => {
	clear(fieldEls.get('moveLight-properties'));
};

/** 窗口打开时刷新候选项。原先是元素优先 API（经 fieldEls 取到元素后订阅 open）。 */
const onWindowOpen = () => {
	fieldEls.get('moveLight-easingId')?.loadItems?.(Data.createEasingItems!());
};

onMounted(() => {
	fieldEls.get('moveLight-properties')?.bind?.(LightProperty);
	useLocalizedOptions('moveLight-wait', [true, false], (items) =>
		fieldEls.get('moveLight-wait')?.loadItems?.(items)
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
