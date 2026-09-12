<template>
	<WindowFrame id="moveElement"
				:ref="registryRef(fieldEls, 'moveElement')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.moveElement.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Element</div>
			<CustomBox id="moveElement-element" v-focus type="element" v-model="form.element" />
			<div class="text">Properties</div>
			<ParamList id="moveElement-properties"
				:ref="registryRef(fieldEls, 'moveElement-properties')" v-focus v-model="form.properties" />
			<div class="text">Easing</div>
			<SelectBox id="moveElement-easingId"
				:ref="registryRef(fieldEls, 'moveElement-easingId')" name="easing" v-model="form.easingId" />
			<div class="text">Duration</div>
			<NumberBox
				id="moveElement-duration"
				name="duration"
				min="0"
				max="3600000"
				unit="ms"
				v-model="duration"
			/>
			<div class="text">Wait</div>
			<SelectBox id="moveElement-wait"
				:ref="registryRef(fieldEls, 'moveElement-wait')" name="wait" v-model="form.wait" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { createElementRegistry, registryRef } from '@app/utils/element-registry';

// P5b 批次 4：本组件的控件元素注册表（替代按 id 查 DOM）
const fieldEls = createElementRegistry();
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

onMounted(() => {
	fieldEls.get('moveElement-properties')?.bind?.(TransformProperty);
	fieldEls.get('moveElement-wait')?.loadItems?.([
		{ name: 'Yes', value: true },
		{ name: 'No', value: false }
	]);
	fieldEls.get('moveElement')?.on?.('open', () => {
		fieldEls.get('moveElement-easingId')?.loadItems?.(Data.createEasingItems!());
	});
	fieldEls.get('moveElement')?.on?.('closed', () => {
		clear(fieldEls.get('moveElement-properties'));
	});
});
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
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
