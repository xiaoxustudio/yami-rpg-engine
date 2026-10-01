<template>
	<WindowFrame id="moveLight-property" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.moveLight-property.title') }}
				<div class="close"></div></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.moveLight-property-key.label') }}</div>
			<SelectBox
				:label="t('components.moveLight-property-key.label')"
				id="moveLight-property-key"
				:ref="fieldRef('moveLight-property-key')"
				v-model="form.key"
			/>
			<div class="text">{{ t('components.moveLight-property-x.label') }}</div>
			<NumberVar
				id="moveLight-property-x"
				:ref="fieldRef('moveLight-property-x')"
				min="0"
				max="512"
				step="0.1"
				decimals="4"
				v-model="form.x"
			/>
			<div class="text">{{ t('components.moveLight-property-y.label') }}</div>
			<NumberVar
				id="moveLight-property-y"
				:ref="fieldRef('moveLight-property-y')"
				min="0"
				max="512"
				step="0.1"
				decimals="4"
				v-model="form.y"
			/>
			<div class="text">{{ t('components.moveLight-property-range.label') }}</div>
			<NumberVar
				id="moveLight-property-range"
				:ref="fieldRef('moveLight-property-range')"
				min="0"
				max="128"
				decimals="4"
				unit="tile"
				v-model="form.range"
			/>
			<div class="text">{{ t('components.moveLight-property-intensity.label') }}</div>
			<NumberVar
				id="moveLight-property-intensity"
				:ref="fieldRef('moveLight-property-intensity')"
				min="0"
				max="1"
				step="0.1"
				decimals="4"
				v-model="form.intensity"
			/>
			<div class="text">{{ t('components.moveLight-property-anchorX.label') }}</div>
			<NumberVar
				id="moveLight-property-anchorX"
				:ref="fieldRef('moveLight-property-anchorX')"
				min="0"
				max="1"
				step="0.1"
				decimals="4"
				v-model="form.anchorX"
			/>
			<div class="text">{{ t('components.moveLight-property-anchorY.label') }}</div>
			<NumberVar
				id="moveLight-property-anchorY"
				:ref="fieldRef('moveLight-property-anchorY')"
				min="0"
				max="1"
				step="0.1"
				decimals="4"
				v-model="form.anchorY"
			/>
			<div class="text">{{ t('components.moveLight-property-width.label') }}</div>
			<NumberVar
				id="moveLight-property-width"
				:ref="fieldRef('moveLight-property-width')"
				min="0"
				max="128"
				decimals="4"
				unit="tile"
				v-model="form.width"
			/>
			<div class="text">{{ t('components.moveLight-property-height.label') }}</div>
			<NumberVar
				id="moveLight-property-height"
				:ref="fieldRef('moveLight-property-height')"
				min="0"
				max="128"
				decimals="4"
				unit="tile"
				v-model="form.height"
			/>
			<div class="text">{{ t('components.moveLight-property-angle.label') }}</div>
			<NumberVar
				id="moveLight-property-angle"
				:ref="fieldRef('moveLight-property-angle')"
				min="-36000"
				max="36000"
				step="5"
				decimals="4"
				unit="deg"
				v-model="form.angle"
			/>
			<div class="text">{{ t('components.moveLight-property-red.label') }}</div>
			<NumberVar
				id="moveLight-property-red"
				:ref="fieldRef('moveLight-property-red')"
				min="0"
				max="255"
				step="5"
				v-model="form.red"
			/>
			<div class="text">{{ t('components.moveLight-property-green.label') }}</div>
			<NumberVar
				id="moveLight-property-green"
				:ref="fieldRef('moveLight-property-green')"
				min="0"
				max="255"
				step="5"
				v-model="form.green"
			/>
			<div class="text">{{ t('components.moveLight-property-blue.label') }}</div>
			<NumberVar
				id="moveLight-property-blue"
				:ref="fieldRef('moveLight-property-blue')"
				min="0"
				max="255"
				step="5"
				v-model="form.blue"
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
import { LightProperty } from '@app/commands/property-window/move-light-property-window';
import { createAccessorFields } from '@app/commands/accessors/accessor-factory.ts';

const { t } = useI18n();

const form = LightProperty.form;

const onConfirm = () => {
	LightProperty.confirm?.(new Event('click'));
};

// 把控件实例登记给属性窗口工厂（替代按 id 查 DOM）
const { fields, fieldRef } = createAccessorFields();
LightProperty.fields = fields;

onMounted(() => {
	// 懒挂载窗口：ParamList.bind 时的 initialize 可能早退，挂载后补齐 key 选项与字段联动
	LightProperty.ensureSetup?.();
});
</script>

<style>
/* 不能用 scoped：-confirm/-cancel 等元素由 WindowFrame 内部生成 */
#moveLight-property {
	width: 324px;
	height: 122px;
}

#moveLight-property-confirm {
	right: 108px;
	bottom: 10px;
}

#moveLight-property-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
