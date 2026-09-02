<template>
	<WindowFrame id="setButton-property">
		<template #title
			><TitleBar
				>{{ t('components.setButton-property.title') }}
				<div class="close"></div></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.setButton-property-key.label') }}</div>
			<SelectBox id="setButton-property-key" v-model="form.key" />
			<div class="text">{{ t('components.setButton-property-image.label') }}</div>
			<CustomBox
				id="setButton-property-image"
				type="file"
				filter="image"
				v-model="form.image"
			/>
			<div class="text">{{ t('components.setButton-property-clip-box.label') }}</div>
			<div id="setButton-property-clip-box" class="box uiElement-grid-box with-4-columns">
				<NumberBox
					id="setButton-property-clip-0"
					min="0"
					max="10000"
					v-model="clip0"
				/>
				<NumberBox
					id="setButton-property-clip-1"
					min="0"
					max="10000"
					v-model="clip1"
				/>
				<NumberBox
					id="setButton-property-clip-2"
					min="0"
					max="4000"
					v-model="clip2"
				/>
				<NumberBox
					id="setButton-property-clip-3"
					min="0"
					max="4000"
					v-model="clip3"
				/>
			</div>
			<div class="text">{{ t('components.setButton-property-tint-box.label') }}</div>
			<div id="setButton-property-tint-box" class="box uiElement-grid-box with-4-columns">
				<NumberBox
					id="setButton-property-tint-0"
					min="-255"
					max="255"
					step="5"
					v-model="tint0"
				/>
				<NumberBox
					id="setButton-property-tint-1"
					min="-255"
					max="255"
					step="5"
					v-model="tint1"
				/>
				<NumberBox
					id="setButton-property-tint-2"
					min="-255"
					max="255"
					step="5"
					v-model="tint2"
				/>
				<NumberBox
					id="setButton-property-tint-3"
					min="0"
					max="255"
					step="5"
					v-model="tint3"
				/>
			</div>
			<div class="text">{{ t('components.setButton-property-imageOpacity.label') }}</div>
			<NumberBox
				id="setButton-property-imageOpacity"
				min="0"
				max="1"
				step="0.05"
				decimals="4"
				v-model="imageOpacity"
			/>
			<div class="text">{{ t('components.setButton-property-content.label') }}</div>
			<TextAreaVar
				id="setButton-property-content"
				menu="tag-local-var tag-global-var tag-dynamic-global-var tag-localization"
				v-model="form.content"
			/>
			<div class="text">{{ t('components.setButton-property-size.label') }}</div>
			<NumberBox
				id="setButton-property-size"
				min="10"
				max="400"
				unit="px"
				v-model="size"
			/>
			<div class="text">{{ t('components.setButton-property-letterSpacing.label') }}</div>
			<NumberBox
				id="setButton-property-letterSpacing"
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

const { t } = useI18n();

const form = ButtonProperty.form;

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

onMounted(() => {});
</script>
