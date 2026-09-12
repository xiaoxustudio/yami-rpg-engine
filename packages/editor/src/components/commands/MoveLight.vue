<template>
	<WindowFrame id="moveLight"
				:ref="registryRef(fieldEls, 'moveLight')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.moveLight.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.moveLight-light.label') }}</div>
			<CustomBox id="moveLight-light"
				:ref="registryRef(fieldEls, 'moveLight-light')" v-focus type="light" v-model="form.light" />
			<div class="text">{{ t('components.moveLight-properties.label') }}</div>
			<ParamList id="moveLight-properties"
				:ref="registryRef(fieldEls, 'moveLight-properties')" v-focus v-model="form.properties" />
			<div class="text">{{ t('components.moveLight-easingId.label') }}</div>
			<SelectBox id="moveLight-easingId"
				:ref="registryRef(fieldEls, 'moveLight-easingId')" name="easing" v-model="form.easingId" />
			<div class="text">{{ t('components.moveLight-duration.label') }}</div>
			<NumberBox
				id="moveLight-duration"
				:ref="registryRef(fieldEls, 'moveLight-duration')"
				name="duration"
				min="0"
				max="3600000"
				unit="ms"
				v-model="duration"
			/>
			<div class="text">{{ t('components.moveLight-wait.label') }}</div>
			<SelectBox id="moveLight-wait"
				:ref="registryRef(fieldEls, 'moveLight-wait')" name="wait" v-model="form.wait" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { createElementRegistry, registryRef } from '@app/utils/element-registry';
import { composableEls } from '@app/composables/element-registry';

// P5b 批次 4：本组件的控件元素注册表（替代按 id 查 DOM）
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

onMounted(() => {
	fieldEls.get('moveLight-properties')?.bind?.(LightProperty);
	fieldEls.get('moveLight-wait')?.loadItems?.([
		{ name: 'Yes', value: true },
		{ name: 'No', value: false }
	]);
	fieldEls.get('moveLight')?.on?.('open', () => {
		fieldEls.get('moveLight-easingId')?.loadItems?.(Data.createEasingItems!());
	});
	fieldEls.get('moveLight')?.on?.('closed', () => {
		clear(fieldEls.get('moveLight-properties'));
	});
});
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
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
