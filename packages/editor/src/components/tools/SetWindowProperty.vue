<template>
	<WindowFrame id="setWindow-property" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setWindow-property.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.setWindow-property-key.label') }}</div>
			<SelectBox
				:label="t('components.setWindow-property-key.label')"
				id="setWindow-property-key"
				v-tip="t('components.setWindow-property-key.tip')"
				:ref="fieldRef('setWindow-property-key')"
				v-model="form.key"
			/>
			<div class="text">{{ t('components.setWindow-property-scrollX.label') }}</div>
			<NumberVar
				id="setWindow-property-scrollX"
				:ref="fieldRef('setWindow-property-scrollX')"
				min="0"
				max="10000"
				unit="px"
				v-model="form.scrollX"
			/>
			<div class="text">{{ t('components.setWindow-property-scrollY.label') }}</div>
			<NumberVar
				id="setWindow-property-scrollY"
				:ref="fieldRef('setWindow-property-scrollY')"
				min="0"
				max="10000"
				unit="px"
				v-model="form.scrollY"
			/>
			<div class="text">{{ t('components.setWindow-property-gridWidth.label') }}</div>
			<NumberVar
				id="setWindow-property-gridWidth"
				:ref="fieldRef('setWindow-property-gridWidth')"
				min="0"
				max="1000"
				unit="px"
				v-model="form.gridWidth"
			/>
			<div class="text">{{ t('components.setWindow-property-gridHeight.label') }}</div>
			<NumberVar
				id="setWindow-property-gridHeight"
				:ref="fieldRef('setWindow-property-gridHeight')"
				min="0"
				max="1000"
				unit="px"
				v-model="form.gridHeight"
			/>
			<div class="text">{{ t('components.setWindow-property-gridGapX.label') }}</div>
			<NumberVar
				id="setWindow-property-gridGapX"
				:ref="fieldRef('setWindow-property-gridGapX')"
				min="0"
				max="1000"
				unit="px"
				v-model="form.gridGapX"
			/>
			<div class="text">{{ t('components.setWindow-property-gridGapY.label') }}</div>
			<NumberVar
				id="setWindow-property-gridGapY"
				:ref="fieldRef('setWindow-property-gridGapY')"
				min="0"
				max="1000"
				unit="px"
				v-model="form.gridGapY"
			/>
			<div class="text">{{ t('components.setWindow-property-paddingX.label') }}</div>
			<NumberVar
				id="setWindow-property-paddingX"
				:ref="fieldRef('setWindow-property-paddingX')"
				min="0"
				max="1000"
				unit="px"
				v-model="form.paddingX"
			/>
			<div class="text">{{ t('components.setWindow-property-paddingY.label') }}</div>
			<NumberVar
				id="setWindow-property-paddingY"
				:ref="fieldRef('setWindow-property-paddingY')"
				min="0"
				max="1000"
				unit="px"
				v-model="form.paddingY"
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
import { WindowProperty } from '@app/commands/property-window/set-window-property-window';
import { createAccessorFields } from '@app/commands/accessors/accessor-factory.ts';

const { t } = useI18n();

const form = WindowProperty.form;

const onConfirm = () => {
	WindowProperty.confirm?.(new Event('click'));
};

const { fields, fieldRef } = createAccessorFields();
WindowProperty.fields = fields;

onMounted(() => {
	WindowProperty.ensureSetup?.();
});
</script>

<style>
#setWindow-property {
	width: 324px;
	height: 122px;
}

#setWindow-property-confirm {
	right: 108px;
	bottom: 10px;
}

#setWindow-property-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
