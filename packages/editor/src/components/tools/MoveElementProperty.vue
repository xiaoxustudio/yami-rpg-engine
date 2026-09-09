<template>
	<WindowFrame id="moveElement-property">
		<template #title
			><TitleBar
				>{{ t('components.moveElement-property.title') }}
				<div class="close"></div></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.moveElement-property-key.label') }}</div>
			<SelectBox id="moveElement-property-key" v-model="form.key" />
			<div class="text">{{ t('components.moveElement-property-anchorX.label') }}</div>
			<NumberVar
				id="moveElement-property-anchorX"
				min="-100"
				max="100"
				step="0.1"
				decimals="4"
				v-model="form.anchorX"
			/>
			<div class="text">{{ t('components.moveElement-property-anchorY.label') }}</div>
			<NumberVar
				id="moveElement-property-anchorY"
				min="-100"
				max="100"
				step="0.1"
				decimals="4"
				v-model="form.anchorY"
			/>
			<div class="text">{{ t('components.moveElement-property-x.label') }}</div>
			<NumberVar
				id="moveElement-property-x"
				min="-10000"
				max="10000"
				decimals="4"
				unit="px"
				v-model="form.x"
			/>
			<div class="text">{{ t('components.moveElement-property-y.label') }}</div>
			<NumberVar
				id="moveElement-property-y"
				min="-10000"
				max="10000"
				decimals="4"
				unit="px"
				v-model="form.y"
			/>
			<div class="text">{{ t('components.moveElement-property-width.label') }}</div>
			<NumberVar
				id="moveElement-property-width"
				min="-10000"
				max="10000"
				decimals="4"
				unit="px"
				v-model="form.width"
			/>
			<div class="text">{{ t('components.moveElement-property-height.label') }}</div>
			<NumberVar
				id="moveElement-property-height"
				min="-10000"
				max="10000"
				decimals="4"
				unit="px"
				v-model="form.height"
			/>
			<div class="text">{{ t('components.moveElement-property-x2.label') }}</div>
			<NumberVar
				id="moveElement-property-x2"
				min="-100"
				max="100"
				step="0.1"
				decimals="4"
				unit="r"
				v-model="form.x2"
			/>
			<div class="text">{{ t('components.moveElement-property-y2.label') }}</div>
			<NumberVar
				id="moveElement-property-y2"
				min="-100"
				max="100"
				step="0.1"
				decimals="4"
				unit="r"
				v-model="form.y2"
			/>
			<div class="text">{{ t('components.moveElement-property-width2.label') }}</div>
			<NumberVar
				id="moveElement-property-width2"
				min="-100"
				max="100"
				step="0.1"
				decimals="4"
				unit="r"
				v-model="form.width2"
			/>
			<div class="text">{{ t('components.moveElement-property-height2.label') }}</div>
			<NumberVar
				id="moveElement-property-height2"
				min="-100"
				max="100"
				step="0.1"
				decimals="4"
				unit="r"
				v-model="form.height2"
			/>
			<div class="text">{{ t('components.moveElement-property-rotation.label') }}</div>
			<NumberVar
				id="moveElement-property-rotation"
				min="-36000"
				max="36000"
				decimals="4"
				unit="deg"
				v-model="form.rotation"
			/>
			<div class="text">{{ t('components.moveElement-property-scaleX.label') }}</div>
			<NumberVar
				id="moveElement-property-scaleX"
				min="-100"
				max="100"
				step="0.1"
				decimals="4"
				v-model="form.scaleX"
			/>
			<div class="text">{{ t('components.moveElement-property-scaleY.label') }}</div>
			<NumberVar
				id="moveElement-property-scaleY"
				min="-100"
				max="100"
				step="0.1"
				decimals="4"
				v-model="form.scaleY"
			/>
			<div class="text">{{ t('components.moveElement-property-skewX.label') }}</div>
			<NumberVar
				id="moveElement-property-skewX"
				min="-100"
				max="100"
				step="0.1"
				decimals="4"
				v-model="form.skewX"
			/>
			<div class="text">{{ t('components.moveElement-property-skewY.label') }}</div>
			<NumberVar
				id="moveElement-property-skewY"
				min="-100"
				max="100"
				step="0.1"
				decimals="4"
				v-model="form.skewY"
			/>
			<div class="text">{{ t('components.moveElement-property-opacity.label') }}</div>
			<NumberVar
				id="moveElement-property-opacity"
				min="0"
				max="1"
				step="0.05"
				decimals="4"
				v-model="form.opacity"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import { TransformProperty } from '@app/commands/property-window/move-element-property-window';

const { t } = useI18n();

const form = TransformProperty.form;

onMounted(() => {
	// 懒挂载窗口：ParamList.bind 时的 initialize 可能早退，挂载后补齐 key 选项与字段联动
	TransformProperty.ensureSetup?.();
});
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
#moveElement-property {
	width: 324px;
	height: 122px;
}

#moveElement-property-confirm {
	right: 108px;
	bottom: 10px;
}

#moveElement-property-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
