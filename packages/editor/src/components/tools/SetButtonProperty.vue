<template>
	<WindowFrame id="setButton-property" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setButton-property.title') }}
				<div class="close"></div></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.setButton-property-key.label') }}</div>
			<SelectBox id="setButton-property-key"
				v-tip="t('components.setButton-property-key.tip')"
				:ref="fieldRef('setButton-property-key')" v-model="form.key" />
			<div class="text">{{ t('components.setButton-property-image.label') }}</div>
			<CustomBox
				id="setButton-property-image"
				:ref="fieldRef('setButton-property-image')"
				type="file"
				filter="image"
				v-model="form.image"
			/>
			<div class="text">{{ t('components.setButton-property-clip-box.label') }}</div>
			<div id="setButton-property-clip-box"
				:ref="fieldRef('setButton-property-clip-box')" class="box uiElement-grid-box with-4-columns">
				<NumberBox
					id="setButton-property-clip-0"
				:ref="fieldRef('setButton-property-clip-0')"
					min="0"
					max="10000"
					v-model="clip0"
				/>
				<NumberBox
					id="setButton-property-clip-1"
				:ref="fieldRef('setButton-property-clip-1')"
					min="0"
					max="10000"
					v-model="clip1"
				/>
				<NumberBox
					id="setButton-property-clip-2"
				:ref="fieldRef('setButton-property-clip-2')"
					min="0"
					max="4000"
					v-model="clip2"
				/>
				<NumberBox
					id="setButton-property-clip-3"
				:ref="fieldRef('setButton-property-clip-3')"
					min="0"
					max="4000"
					v-model="clip3"
				/>
			</div>
			<div class="text">{{ t('components.setButton-property-tint-box.label') }}</div>
			<div id="setButton-property-tint-box"
				:ref="fieldRef('setButton-property-tint-box')" class="box uiElement-grid-box with-4-columns">
				<NumberBox
					id="setButton-property-tint-0"
				:ref="fieldRef('setButton-property-tint-0')"
					min="-255"
					max="255"
					step="5"
					v-model="tint0"
				/>
				<NumberBox
					id="setButton-property-tint-1"
				:ref="fieldRef('setButton-property-tint-1')"
					min="-255"
					max="255"
					step="5"
					v-model="tint1"
				/>
				<NumberBox
					id="setButton-property-tint-2"
				:ref="fieldRef('setButton-property-tint-2')"
					min="-255"
					max="255"
					step="5"
					v-model="tint2"
				/>
				<NumberBox
					id="setButton-property-tint-3"
				:ref="fieldRef('setButton-property-tint-3')"
					min="0"
					max="255"
					step="5"
					v-model="tint3"
				/>
			</div>
			<div class="text">{{ t('components.setButton-property-imageOpacity.label') }}</div>
			<NumberBox
				id="setButton-property-imageOpacity"
				:ref="fieldRef('setButton-property-imageOpacity')"
				min="0"
				max="1"
				step="0.05"
				decimals="4"
				v-model="imageOpacity"
			/>
			<div class="text">{{ t('components.setButton-property-content.label') }}</div>
			<TextAreaVar
				id="setButton-property-content"
				:ref="fieldRef('setButton-property-content')"
				menu="tag-local-var tag-global-var tag-dynamic-global-var tag-localization"
				v-model="form.content"
			/>
			<div class="text">{{ t('components.setButton-property-size.label') }}</div>
			<NumberBox
				id="setButton-property-size"
				:ref="fieldRef('setButton-property-size')"
				min="10"
				max="400"
				unit="px"
				v-model="size"
			/>
			<div class="text">{{ t('components.setButton-property-letterSpacing.label') }}</div>
			<NumberBox
				id="setButton-property-letterSpacing"
				:ref="fieldRef('setButton-property-letterSpacing')"
				min="-10"
				max="100"
				unit="px"
				v-model="letterSpacing"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import TextAreaVar from '@app/components/common/TextAreaVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import { ButtonProperty } from '@app/commands/property-window/set-button-property-window';
import { createAccessorFields } from '@app/commands/accessors/accessor-factory.ts';

const { t } = useI18n();

const form = ButtonProperty.form;

const onConfirm = () => {
	ButtonProperty.confirm?.(new Event('click'));
};

// P5b 批次 2：把控件实例登记给属性窗口工厂（替代按 id 查 DOM）
const { fields, fieldRef } = createAccessorFields();
ButtonProperty.fields = fields;

const numberField = (key: string) =>
	computed({
		get: () => form[key] as number | string,
		set: (value) => {
			form[key] = value;
		}
	});
const clip0 = numberField('clip-0');
const clip1 = numberField('clip-1');
const clip2 = numberField('clip-2');
const clip3 = numberField('clip-3');
const tint0 = numberField('tint-0');
const tint1 = numberField('tint-1');
const tint2 = numberField('tint-2');
const tint3 = numberField('tint-3');
const imageOpacity = numberField('imageOpacity');
const size = numberField('size');
const letterSpacing = numberField('letterSpacing');

onMounted(() => {
	// 懒挂载窗口：ParamList.bind 时的 initialize 可能早退，挂载后补齐 key 选项与字段联动
	ButtonProperty.ensureSetup?.();
});
</script>

<style>
/* 窗口尺寸样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
#setButton-property {
	width: 324px;
	height: 194px;
}

#setButton-property-content {
	height: 92px;
}

#setButton-property-confirm {
	right: 108px;
	bottom: 10px;
}

#setButton-property-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
