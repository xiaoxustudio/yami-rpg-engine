<template>
	<!-- 设置文本框 - 属性 -->
	<WindowFrame id="setTextBox-property">
		<template #title
			><TitleBar
				>{{ t('components.setTextBox-property.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.setTextBox-property-key.label') }}</div>
			<SelectBox id="setTextBox-property-key" v-model="form.key" />
			<div class="text">{{ t('components.setTextBox-property-type.label') }}</div>
			<SelectBox id="setTextBox-property-type" v-model="form.type" />
			<div class="text">{{ t('components.setTextBox-property-text.label') }}</div>
			<StringVar id="setTextBox-property-text" v-model="form.text" />
			<div class="text">{{ t('components.setTextBox-property-number.label') }}</div>
			<NumberVar
				id="setTextBox-property-number"
				min="-1000000000"
				max="1000000000"
				decimals="10"
				v-model="form.number"
			/>
			<div class="text">{{ t('components.setTextBox-property-min.label') }}</div>
			<NumberVar
				id="setTextBox-property-min"
				min="-1000000000"
				max="1000000000"
				decimals="10"
				v-model="form.min"
			/>
			<div class="text">{{ t('components.setTextBox-property-max.label') }}</div>
			<NumberVar
				id="setTextBox-property-max"
				min="-1000000000"
				max="1000000000"
				decimals="10"
				v-model="form.max"
			/>
			<div class="text">{{ t('components.setTextBox-property-decimals.label') }}</div>
			<NumberBox id="setTextBox-property-decimals" min="0" max="10" v-model="decimals" />
			<div class="text">{{ t('components.setTextBox-property-color.label') }}</div>
			<ColorBox id="setTextBox-property-color" v-model="color" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import ColorBox from '@app/components/common/ColorBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import StringVar from '@app/components/common/StringVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import { TextBoxProperty } from '@app/commands/property-window/set-textbox-property-window';

const { t } = useI18n();

const form = TextBoxProperty.form;

const decimals = computed({
	get: () => form.decimals as number | string,
	set: (value) => {
		form.decimals = value;
	}
});
const color = computed({
	get: () => form.color as string | undefined,
	set: (value) => {
		form.color = value;
	}
});

onMounted(() => {});
</script>
