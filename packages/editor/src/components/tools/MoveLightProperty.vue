<template>
	<WindowFrame id="moveLight-property">
		<template #title
			><TitleBar
				>{{ t('components.moveLight-property.title') }}
				<div class="close"></div></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.moveLight-property-key.label') }}</div>
			<SelectBox id="moveLight-property-key" v-model="form.key" />
			<div class="text">{{ t('components.moveLight-property-x.label') }}</div>
			<NumberVar
				id="moveLight-property-x"
				min="0"
				max="512"
				step="0.1"
				decimals="4"
				v-model="form.x"
			/>
			<div class="text">{{ t('components.moveLight-property-y.label') }}</div>
			<NumberVar
				id="moveLight-property-y"
				min="0"
				max="512"
				step="0.1"
				decimals="4"
				v-model="form.y"
			/>
			<div class="text">{{ t('components.moveLight-property-range.label') }}</div>
			<NumberVar
				id="moveLight-property-range"
				min="0"
				max="128"
				decimals="4"
				unit="tile"
				v-model="form.range"
			/>
			<div class="text">{{ t('components.moveLight-property-intensity.label') }}</div>
			<NumberVar
				id="moveLight-property-intensity"
				min="0"
				max="1"
				step="0.1"
				decimals="4"
				v-model="form.intensity"
			/>
			<div class="text">{{ t('components.moveLight-property-anchorX.label') }}</div>
			<NumberVar
				id="moveLight-property-anchorX"
				min="0"
				max="1"
				step="0.1"
				decimals="4"
				v-model="form.anchorX"
			/>
			<div class="text">{{ t('components.moveLight-property-anchorY.label') }}</div>
			<NumberVar
				id="moveLight-property-anchorY"
				min="0"
				max="1"
				step="0.1"
				decimals="4"
				v-model="form.anchorY"
			/>
			<div class="text">{{ t('components.moveLight-property-width.label') }}</div>
			<NumberVar
				id="moveLight-property-width"
				min="0"
				max="128"
				decimals="4"
				unit="tile"
				v-model="form.width"
			/>
			<div class="text">{{ t('components.moveLight-property-height.label') }}</div>
			<NumberVar
				id="moveLight-property-height"
				min="0"
				max="128"
				decimals="4"
				unit="tile"
				v-model="form.height"
			/>
			<div class="text">{{ t('components.moveLight-property-angle.label') }}</div>
			<NumberVar
				id="moveLight-property-angle"
				min="-36000"
				max="36000"
				step="5"
				decimals="4"
				unit="deg"
				v-model="form.angle"
			/>
			<div class="text">{{ t('components.moveLight-property-red.label') }}</div>
			<NumberVar id="moveLight-property-red" min="0" max="255" step="5" v-model="form.red" />
			<div class="text">{{ t('components.moveLight-property-green.label') }}</div>
			<NumberVar
				id="moveLight-property-green"
				min="0"
				max="255"
				step="5"
				v-model="form.green"
			/>
			<div class="text">{{ t('components.moveLight-property-blue.label') }}</div>
			<NumberVar
				id="moveLight-property-blue"
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

const { t } = useI18n();

const form = LightProperty.form;

onMounted(() => {});
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
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
