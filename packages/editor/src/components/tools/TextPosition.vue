<template>
	<WindowFrame id="textPosition" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.textPosition.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.textPosition-axis.label') }}</div>
			<SelectBox
				:label="t('components.textPosition-axis.label')"
				id="textPosition-axis"
				v-tip="t('components.textPosition-axis.tip')"
				:ref="controlRef('textPosition-axis')"
				v-model="form.axis"
			/>
			<div class="text">{{ t('components.textPosition-operation.label') }}</div>
			<SelectBox
				:label="t('components.textPosition-operation.label')"
				id="textPosition-operation"
				v-tip="t('components.textPosition-operation.tip')"
				:ref="controlRef('textPosition-operation')"
				v-model="form.operation"
			/>
			<div class="text">{{ t('components.textPosition-value.label') }}</div>
			<NumberBox
				:label="t('components.textPosition-value.label')"
				id="textPosition-value"
				v-tip="t('components.textPosition-value.tip')"
				min="-1000"
				max="1000"
				unit="px"
				v-model="form.value"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { Selection } from '@app/tools/text-capture.ts';
import { useTextCaptureWindow } from '@app/composables/useTextCaptureWindow';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import { useControlRefs } from '@app/composables/control-refs';

/** 控件 id 联合：模板与脚本共用，拼错在 tsc / vue-tsc 就红。 */
type Id = 'textPosition-axis' | 'textPosition-operation';

const { controls, controlRef } = useControlRefs<Id>();

const { t } = useI18n();

const form = useTextCaptureWindow().textPosition.form;

const onConfirm = () => {
	Selection?.textPosition?.confirm?.(new Event('click'));
};

/** 候选与联动是窗口自己的配置（原在 `Selection.textPosition.initialize` 里按 id 取元素）。 */
onMounted(() => {
	controls['textPosition-axis']?.loadItems?.([
		{ name: 'X', value: 'x' },
		{ name: 'Y', value: 'y' }
	]);
	controls['textPosition-operation']?.loadItems?.([
		{ name: 'Set', value: 'set' },
		{ name: 'Add', value: 'add' }
	]);
});
</script>

<style>
#textPosition {
	width: 324px;
	height: 146px;
}

#textPosition-confirm {
	right: 108px;
	bottom: 10px;
}

#textPosition-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
