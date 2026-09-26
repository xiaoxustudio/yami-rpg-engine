<template>
	<WindowFrame id="setImage-property" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setImage-property.title') }}
				<div class="close"></div></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.setImage-property-key.label') }}</div>
			<SelectBox
				id="setImage-property-key"
				:ref="fieldRef('setImage-property-key')"
				v-model="form.key"
			/>
			<div class="text">{{ t('components.setImage-property-image.label') }}</div>
			<CustomBox
				id="setImage-property-image"
				:ref="fieldRef('setImage-property-image')"
				type="file"
				filter="image"
				v-model="form.image"
			/>
			<div class="text">{{ t('components.setImage-property-display.label') }}</div>
			<SelectBox
				id="setImage-property-display"
				:ref="fieldRef('setImage-property-display')"
				v-model="form.display"
			/>
			<div class="text">{{ t('components.setImage-property-flip.label') }}</div>
			<SelectBox
				id="setImage-property-flip"
				:ref="fieldRef('setImage-property-flip')"
				v-model="form.flip"
			/>
			<div class="text">{{ t('components.setImage-property-blend.label') }}</div>
			<SelectBox
				id="setImage-property-blend"
				:ref="fieldRef('setImage-property-blend')"
				v-model="form.blend"
			/>
			<div class="text">{{ t('components.setImage-property-shiftX.label') }}</div>
			<NumberVar
				id="setImage-property-shiftX"
				:ref="fieldRef('setImage-property-shiftX')"
				min="-10000"
				max="10000"
				unit="px"
				v-model="form.shiftX"
			/>
			<div class="text">{{ t('components.setImage-property-shiftY.label') }}</div>
			<NumberVar
				id="setImage-property-shiftY"
				:ref="fieldRef('setImage-property-shiftY')"
				min="-10000"
				max="10000"
				unit="px"
				v-model="form.shiftY"
			/>
			<div class="text">{{ t('components.setImage-property-clip-0.label') }}</div>
			<NumberVar
				id="setImage-property-clip-0"
				:ref="fieldRef('setImage-property-clip-0')"
				min="0"
				max="10000"
				unit="px"
				v-model="form['clip-0']"
			/>
			<div class="text">{{ t('components.setImage-property-clip-1.label') }}</div>
			<NumberVar
				id="setImage-property-clip-1"
				:ref="fieldRef('setImage-property-clip-1')"
				min="0"
				max="10000"
				unit="px"
				v-model="form['clip-1']"
			/>
			<div class="text">{{ t('components.setImage-property-clip-2.label') }}</div>
			<NumberVar
				id="setImage-property-clip-2"
				:ref="fieldRef('setImage-property-clip-2')"
				min="0"
				max="10000"
				unit="px"
				v-model="form['clip-2']"
			/>
			<div class="text">{{ t('components.setImage-property-clip-3.label') }}</div>
			<NumberVar
				id="setImage-property-clip-3"
				:ref="fieldRef('setImage-property-clip-3')"
				min="0"
				max="10000"
				unit="px"
				v-model="form['clip-3']"
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
import { ImageProperty } from '@app/commands/property-window/set-image-property-window';
import { createAccessorFields } from '@app/commands/accessors/accessor-factory.ts';

const { t } = useI18n();

const form = ImageProperty.form;

const onConfirm = () => {
	ImageProperty.confirm?.(new Event('click'));
};

// 把控件实例登记给属性窗口工厂（替代按 id 查 DOM）
const { fields, fieldRef } = createAccessorFields();
ImageProperty.fields = fields;

onMounted(() => {
	// 懒挂载窗口：ParamList.bind 时的 initialize 可能早退，挂载后补齐 key 选项与字段联动
	ImageProperty.ensureSetup?.();
});
</script>

<style>
/* 不能用 scoped：-confirm/-cancel 等元素由 WindowFrame 内部生成 */
#setImage-property {
	width: 324px;
	height: 122px;
}

#setImage-property-confirm {
	right: 108px;
	bottom: 10px;
}

#setImage-property-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
