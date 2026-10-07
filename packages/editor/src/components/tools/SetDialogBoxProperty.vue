<template>
	<WindowFrame id="setDialogBox-property" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setDialogBox-property.title') }}
				<div class="close"></div></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.setDialogBox-property-key.label') }}</div>
			<SelectBox
				:label="t('components.setDialogBox-property-key.label')"
				id="setDialogBox-property-key"
				:ref="fieldRef('setDialogBox-property-key')"
				v-tip="t('components.setDialogBox-property-key.tip')"
				v-model="form.key"
			/>
			<div class="text">{{ t('components.setDialogBox-property-content.label') }}</div>
			<TextAreaVar
				id="setDialogBox-property-content"
				:ref="fieldRef('setDialogBox-property-content')"
				menu="tag-local-var tag-global-var tag-localization"
				v-model="form.content"
			/>
			<div class="text">{{ t('components.setDialogBox-property-interval.label') }}</div>
			<NumberBox
				:label="t('components.setDialogBox-property-interval.label')"
				id="setDialogBox-property-interval"
				:ref="fieldRef('setDialogBox-property-interval')"
				min="0"
				max="100"
				unit="ms"
				v-model="interval"
			/>
			<div class="text">{{ t('components.setDialogBox-property-size.label') }}</div>
			<NumberBox
				:label="t('components.setDialogBox-property-size.label')"
				id="setDialogBox-property-size"
				:ref="fieldRef('setDialogBox-property-size')"
				min="10"
				max="400"
				unit="px"
				v-model="size"
			/>
			<div class="text">{{ t('components.setDialogBox-property-lineSpacing.label') }}</div>
			<NumberBox
				:label="t('components.setDialogBox-property-lineSpacing.label')"
				id="setDialogBox-property-lineSpacing"
				:ref="fieldRef('setDialogBox-property-lineSpacing')"
				min="-10"
				max="100"
				unit="px"
				v-model="lineSpacing"
			/>
			<div class="text">{{ t('components.setDialogBox-property-letterSpacing.label') }}</div>
			<NumberBox
				:label="t('components.setDialogBox-property-letterSpacing.label')"
				id="setDialogBox-property-letterSpacing"
				:ref="fieldRef('setDialogBox-property-letterSpacing')"
				min="-10"
				max="100"
				unit="px"
				v-model="letterSpacing"
			/>
			<div class="text">{{ t('components.setDialogBox-property-color.label') }}</div>
			<ColorBox
				:label="t('components.setDialogBox-property-color.label')"
				id="setDialogBox-property-color"
				:ref="fieldRef('setDialogBox-property-color')"
				v-model="color"
			/>
			<div class="text">{{ t('components.setDialogBox-property-font.label') }}</div>
			<TextBox
				:label="t('components.setDialogBox-property-font.label')"
				id="setDialogBox-property-font"
				:ref="fieldRef('setDialogBox-property-font')"
				v-model="font"
			/>
			<div class="text">{{ t('components.setDialogBox-property-effect-type.label') }}</div>
			<SelectBox
				:label="t('components.setDialogBox-property-effect-type.label')"
				id="setDialogBox-property-effect-type"
				:ref="fieldRef('setDialogBox-property-effect-type')"
				v-model="form['effect-type']"
			/>
			<div class="text">
				{{ t('components.setDialogBox-property-effect-shadowOffsetX.label') }}
			</div>
			<NumberBox
				:label="t('components.setDialogBox-property-effect-shadowOffsetX.label')"
				id="setDialogBox-property-effect-shadowOffsetX"
				:ref="fieldRef('setDialogBox-property-effect-shadowOffsetX')"
				min="-9"
				max="9"
				unit="px"
				v-model="shadowOffsetX"
			/>
			<div class="text">
				{{ t('components.setDialogBox-property-effect-shadowOffsetY.label') }}
			</div>
			<NumberBox
				:label="t('components.setDialogBox-property-effect-shadowOffsetY.label')"
				id="setDialogBox-property-effect-shadowOffsetY"
				:ref="fieldRef('setDialogBox-property-effect-shadowOffsetY')"
				min="-9"
				max="9"
				unit="px"
				v-model="shadowOffsetY"
			/>
			<div class="text">
				{{ t('components.setDialogBox-property-effect-strokeWidth.label') }}
			</div>
			<NumberBox
				:label="t('components.setDialogBox-property-effect-strokeWidth.label')"
				id="setDialogBox-property-effect-strokeWidth"
				:ref="fieldRef('setDialogBox-property-effect-strokeWidth')"
				min="1"
				max="20"
				unit="px"
				v-model="strokeWidth"
			/>
			<div class="text">{{ t('components.setDialogBox-property-effect-color.label') }}</div>
			<ColorBox
				:label="t('components.setDialogBox-property-effect-color.label')"
				id="setDialogBox-property-effect-color"
				:ref="fieldRef('setDialogBox-property-effect-color')"
				v-model="effectColor"
			/>
			<div class="text">{{ t('components.setDialogBox-property-blend.label') }}</div>
			<SelectBox
				:label="t('components.setDialogBox-property-blend.label')"
				id="setDialogBox-property-blend"
				:ref="fieldRef('setDialogBox-property-blend')"
				v-model="form.blend"
			/>
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
import TextAreaVar from '@app/components/common/TextAreaVar.vue';
import TextBox from '@app/components/common/TextBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import { DialogBoxProperty } from '@app/commands/property-window/set-dialog-property-window';
import { createAccessorFields } from '@app/commands/accessors/accessor-factory.ts';

const { t } = useI18n();

const form = DialogBoxProperty.form;

const onConfirm = () => {
	DialogBoxProperty.confirm?.(new Event('click'));
};

const { fields, fieldRef } = createAccessorFields();
DialogBoxProperty.fields = fields;

const numberField = (key: string) =>
	computed({
		get: () => form[key] as number | string,
		set: (value) => {
			form[key] = value;
		}
	});
const stringField = (key: string) =>
	computed({
		get: () => form[key] as string | undefined,
		set: (value) => {
			form[key] = value;
		}
	});
const interval = numberField('interval');
const size = numberField('size');
const lineSpacing = numberField('lineSpacing');
const letterSpacing = numberField('letterSpacing');
const shadowOffsetX = numberField('effect-shadowOffsetX');
const shadowOffsetY = numberField('effect-shadowOffsetY');
const strokeWidth = numberField('effect-strokeWidth');
const color = stringField('color');
const font = stringField('font');
const effectColor = stringField('effect-color');

onMounted(() => {
	DialogBoxProperty.ensureSetup?.();
});
</script>

<style>
#setDialogBox-property {
	width: 324px;
	height: 194px;
}

#setDialogBox-property-content {
	height: 92px;
}

#setDialogBox-property-confirm {
	right: 108px;
	bottom: 10px;
}

#setDialogBox-property-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
