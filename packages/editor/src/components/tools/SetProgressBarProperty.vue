<template>
	<WindowFrame id="setProgressBar-property" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setProgressBar-property.title') }}
				<div class="close"></div></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.setProgressBar-property-key.label') }}</div>
			<SelectBox id="setProgressBar-property-key"
				v-tip="t('components.setProgressBar-property-key.tip')" v-model="form.key" />
			<div class="text">{{ t('components.setProgressBar-property-image.label') }}</div>
			<CustomBox
				id="setProgressBar-property-image"
				type="file"
				filter="image"
				v-model="form.image"
			/>
			<div class="text">{{ t('components.setProgressBar-property-display.label') }}</div>
			<SelectBox id="setProgressBar-property-display"
				:ref="fieldRef('setProgressBar-property-display')" v-model="form.display" />
			<div class="text">{{ t('components.setProgressBar-property-blend.label') }}</div>
			<SelectBox id="setProgressBar-property-blend"
				:ref="fieldRef('setProgressBar-property-blend')" v-model="form.blend" />
			<div class="text">{{ t('components.setProgressBar-property-progress.label') }}</div>
			<NumberVar
				id="setProgressBar-property-progress"
				min="0"
				max="1"
				step="0.1"
				decimals="4"
				v-model="form.progress"
			/>
			<div class="text">{{ t('components.setProgressBar-property-clip-0.label') }}</div>
			<NumberVar
				id="setProgressBar-property-clip-0"
				min="0"
				max="10000"
				unit="px"
				v-model="form['clip-0']"
			/>
			<div class="text">{{ t('components.setProgressBar-property-clip-1.label') }}</div>
			<NumberVar
				id="setProgressBar-property-clip-1"
				min="0"
				max="10000"
				unit="px"
				v-model="form['clip-1']"
			/>
			<div class="text">{{ t('components.setProgressBar-property-clip-2.label') }}</div>
			<NumberVar
				id="setProgressBar-property-clip-2"
				min="0"
				max="10000"
				unit="px"
				v-model="form['clip-2']"
			/>
			<div class="text">{{ t('components.setProgressBar-property-clip-3.label') }}</div>
			<NumberVar
				id="setProgressBar-property-clip-3"
				min="0"
				max="10000"
				unit="px"
				v-model="form['clip-3']"
			/>
			<div class="text">{{ t('components.setProgressBar-property-color-0.label') }}</div>
			<NumberVar
				id="setProgressBar-property-color-0"
				min="0"
				max="255"
				v-model="form['color-0']"
			/>
			<div class="text">{{ t('components.setProgressBar-property-color-1.label') }}</div>
			<NumberVar
				id="setProgressBar-property-color-1"
				min="0"
				max="255"
				v-model="form['color-1']"
			/>
			<div class="text">{{ t('components.setProgressBar-property-color-2.label') }}</div>
			<NumberVar
				id="setProgressBar-property-color-2"
				min="0"
				max="255"
				v-model="form['color-2']"
			/>
			<div class="text">{{ t('components.setProgressBar-property-color-3.label') }}</div>
			<NumberVar
				id="setProgressBar-property-color-3"
				min="0"
				max="255"
				v-model="form['color-3']"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import { ProgressBarProperty } from '@app/commands/property-window/set-progress-property-window';
import { createAccessorFields } from '@app/commands/accessors/accessor-factory.ts';

const { t } = useI18n();

const form = ProgressBarProperty.form;

const onConfirm = () => {
	ProgressBarProperty.confirm?.(new Event('click'));
};

// P5b 批次 2：把控件实例登记给属性窗口工厂（替代按 id 查 DOM）
const { fields, fieldRef } = createAccessorFields();
ProgressBarProperty.fields = fields;

onMounted(() => {
	// 懒挂载窗口：ParamList.bind 时的 initialize 可能早退，挂载后补齐 key 选项与字段联动
	ProgressBarProperty.ensureSetup?.();
});
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
#setProgressBar-property {
	width: 324px;
	height: 122px;
}

#setProgressBar-property-confirm {
	right: 108px;
	bottom: 10px;
}

#setProgressBar-property-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
