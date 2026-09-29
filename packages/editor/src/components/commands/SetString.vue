<template>
	<WindowFrame id="setString" :ref="registryRef(fieldEls, 'setString')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setString.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.setString-variable.label') }}</div>
			<CustomBox
				id="setString-variable"
				:ref="registryRef(fieldEls, 'setString-variable')"
				v-focus
				type="variable"
				filter="writable-string"
				v-model="form.variable"
			/>
			<div class="text">{{ t('components.setString-operation.label') }}</div>
			<SelectBox
				id="setString-operation"
				v-tip="t('components.setString-operation.tip')"
				:ref="registryRef(fieldEls, 'setString-operation')"
				v-model="form.operation"
			/>
			<div class="text">{{ t('components.setString-operand-type.label') }}</div>
			<SelectBox
				id="setString-operand-type"
				v-tip="t('components.setString-operand-type.tip')"
				:ref="registryRef(fieldEls, 'setString-operand-type')"
				v-model="form.operandType"
				@write="onWrite"
			/>
			<div class="text">{{ t('components.setString-operand-common-value.label') }}</div>
			<TextArea
				id="setString-operand-common-value"
				:ref="registryRef(fieldEls, 'setString-operand-common-value')"
				menu="tag-local-var tag-global-var tag-localization"
				v-model="commonValue"
			/>
			<div class="text">{{ t('components.setString-operand-string-method.label') }}</div>
			<SelectBox
				id="setString-operand-string-method"
				v-tip="t('components.setString-operand-string-method.tip')"
				:ref="registryRef(fieldEls, 'setString-operand-string-method')"
				v-model="form.stringMethod"
			/>
			<div class="text">{{ t('components.setString-operand-common-variable.label') }}</div>
			<CustomBox
				id="setString-operand-common-variable"
				v-tip="t('components.setString-operand-common-variable.tip')"
				:ref="registryRef(fieldEls, 'setString-operand-common-variable')"
				v-focus
				type="variable"
				filter="all"
				v-model="form.commonVariable"
			/>
			<div class="text">{{ t('components.setString-operand-string-char-index.label') }}</div>
			<NumberVar
				id="setString-operand-string-char-index"
				v-tip="t('components.setString-operand-string-char-index.tip')"
				:ref="registryRef(fieldEls, 'setString-operand-string-char-index')"
				min="0"
				max="1000000000"
				v-model="form.stringCharIndex"
			/>
			<div class="text">{{ t('components.setString-operand-string-slice-begin.label') }}</div>
			<NumberVar
				id="setString-operand-string-slice-begin"
				v-tip="t('components.setString-operand-string-slice-begin.tip')"
				:ref="registryRef(fieldEls, 'setString-operand-string-slice-begin')"
				min="-1000000000"
				max="1000000000"
				v-model="form.stringSliceBegin"
			/>
			<div class="text">{{ t('components.setString-operand-string-slice-end.label') }}</div>
			<NumberVar
				id="setString-operand-string-slice-end"
				v-tip="t('components.setString-operand-string-slice-end.tip')"
				:ref="registryRef(fieldEls, 'setString-operand-string-slice-end')"
				min="-1000000000"
				max="1000000000"
				v-model="form.stringSliceEnd"
			/>
			<div class="text">
				{{ t('components.setString-operand-string-pad-start-length.label') }}
			</div>
			<NumberBox
				id="setString-operand-string-pad-start-length"
				v-tip="t('components.setString-operand-string-pad-start-length.tip')"
				:ref="registryRef(fieldEls, 'setString-operand-string-pad-start-length')"
				min="2"
				max="10"
				v-model="stringPadStartLength"
			/>
			<div class="text">
				{{ t('components.setString-operand-string-pad-start-pad.label') }}
			</div>
			<TextBox
				id="setString-operand-string-pad-start-pad"
				v-tip="t('components.setString-operand-string-pad-start-pad.tip')"
				:ref="registryRef(fieldEls, 'setString-operand-string-pad-start-pad')"
				v-model="stringPadStartPad"
			/>
			<div class="text">
				{{ t('components.setString-operand-string-replace-pattern.label') }}
			</div>
			<StringVar
				id="setString-operand-string-replace-pattern"
				v-tip="t('components.setString-operand-string-replace-pattern.tip')"
				:ref="registryRef(fieldEls, 'setString-operand-string-replace-pattern')"
				v-focus
				v-model="form.stringReplacePattern"
			/>
			<div class="text">
				{{ t('components.setString-operand-string-replace-replacement.label') }}
			</div>
			<StringVar
				id="setString-operand-string-replace-replacement"
				v-tip="t('components.setString-operand-string-replace-replacement.tip')"
				:ref="registryRef(fieldEls, 'setString-operand-string-replace-replacement')"
				v-model="form.stringReplaceReplacement"
			/>
			<div class="text">
				{{ t('components.setString-operand-attribute-attributeId.label') }}
			</div>
			<CustomBox
				id="setString-operand-attribute-attributeId"
				v-tip="t('components.setString-operand-attribute-attributeId.tip')"
				:ref="registryRef(fieldEls, 'setString-operand-attribute-attributeId')"
				v-focus
				type="attribute"
				v-model="form.attributeId"
			/>
			<div class="text">{{ t('components.setString-operand-enum-stringId.label') }}</div>
			<CustomBox
				id="setString-operand-enum-stringId"
				v-tip="t('components.setString-operand-enum-stringId.tip')"
				:ref="registryRef(fieldEls, 'setString-operand-enum-stringId')"
				v-focus
				type="enum-string"
				v-model="form.enumStringId"
			/>
			<div class="text">{{ t('components.setString-operand-object-property.label') }}</div>
			<SelectBox
				id="setString-operand-object-property"
				v-tip="t('components.setString-operand-object-property.tip')"
				:ref="registryRef(fieldEls, 'setString-operand-object-property')"
				v-model="form.objectProperty"
			/>
			<div class="text">{{ t('components.setString-operand-element-property.label') }}</div>
			<SelectBox
				id="setString-operand-element-property"
				v-tip="t('components.setString-operand-element-property.tip')"
				:ref="registryRef(fieldEls, 'setString-operand-element-property')"
				v-model="form.elementProperty"
			/>
			<div class="text">{{ t('components.setString-operand-element-element.label') }}</div>
			<CustomBox
				id="setString-operand-element-element"
				v-tip="t('components.setString-operand-element-element.tip')"
				:ref="registryRef(fieldEls, 'setString-operand-element-element')"
				type="element"
				v-model="form.elementElement"
			/>
			<div class="text">{{ t('components.setString-operand-common-actor.label') }}</div>
			<CustomBox
				id="setString-operand-common-actor"
				v-tip="t('components.setString-operand-common-actor.tip')"
				:ref="registryRef(fieldEls, 'setString-operand-common-actor')"
				type="actor"
				v-model="form.commonActor"
			/>
			<div class="text">{{ t('components.setString-operand-common-skill.label') }}</div>
			<CustomBox
				id="setString-operand-common-skill"
				v-tip="t('components.setString-operand-common-skill.tip')"
				:ref="registryRef(fieldEls, 'setString-operand-common-skill')"
				type="skill"
				v-model="form.commonSkill"
			/>
			<div class="text">{{ t('components.setString-operand-common-trigger.label') }}</div>
			<CustomBox
				id="setString-operand-common-trigger"
				v-tip="t('components.setString-operand-common-trigger.tip')"
				:ref="registryRef(fieldEls, 'setString-operand-common-trigger')"
				type="trigger"
				v-model="form.commonTrigger"
			/>
			<div class="text">{{ t('components.setString-operand-common-state.label') }}</div>
			<CustomBox
				id="setString-operand-common-state"
				v-tip="t('components.setString-operand-common-state.tip')"
				:ref="registryRef(fieldEls, 'setString-operand-common-state')"
				type="state"
				v-model="form.commonState"
			/>
			<div class="text">{{ t('components.setString-operand-common-equipment.label') }}</div>
			<CustomBox
				id="setString-operand-common-equipment"
				v-tip="t('components.setString-operand-common-equipment.tip')"
				:ref="registryRef(fieldEls, 'setString-operand-common-equipment')"
				type="equipment"
				v-model="form.commonEquipment"
			/>
			<div class="text">{{ t('components.setString-operand-common-item.label') }}</div>
			<CustomBox
				id="setString-operand-common-item"
				v-tip="t('components.setString-operand-common-item.tip')"
				:ref="registryRef(fieldEls, 'setString-operand-common-item')"
				type="item"
				v-model="form.commonItem"
			/>
			<div class="text">{{ t('components.setString-operand-object-fileId.label') }}</div>
			<CustomBox
				id="setString-operand-object-fileId"
				v-tip="t('components.setString-operand-object-fileId.tip')"
				:ref="registryRef(fieldEls, 'setString-operand-object-fileId')"
				v-focus
				type="file"
				v-model="form.objectFileId"
			/>
			<div class="text">{{ t('components.setString-operand-list-index.label') }}</div>
			<NumberVar
				id="setString-operand-list-index"
				v-tip="t('components.setString-operand-list-index.tip')"
				:ref="registryRef(fieldEls, 'setString-operand-list-index')"
				min="0"
				max="1000000000"
				v-model="form.listIndex"
			/>
			<div class="text">{{ t('components.setString-operand-parameter-key.label') }}</div>
			<StringVar
				id="setString-operand-parameter-key"
				:ref="registryRef(fieldEls, 'setString-operand-parameter-key')"
				v-focus
				v-model="form.parameterKey"
			/>
			<div class="text">{{ t('components.setString-operand-script.label') }}</div>
			<TextBox
				id="setString-operand-script"
				v-tip="t('components.setString-operand-script.tip')"
				:ref="registryRef(fieldEls, 'setString-operand-script')"
				v-focus
				v-model="script"
			/>
			<div class="text">{{ t('components.setString-operand-other-data.label') }}</div>
			<SelectBox
				id="setString-operand-other-data"
				v-tip="t('components.setString-operand-other-data.tip')"
				:ref="registryRef(fieldEls, 'setString-operand-other-data')"
				v-model="form.otherData"
			/>
			<div class="text">
				{{ t('components.setString-operand-showChoices-content-choiceIndex.label') }}
			</div>
			<NumberVar
				id="setString-operand-showChoices-content-choiceIndex"
				v-tip="t('components.setString-operand-showChoices-content-choiceIndex.tip')"
				:ref="registryRef(fieldEls, 'setString-operand-showChoices-content-choiceIndex')"
				min="0"
				max="255"
				v-model="form.showChoicesIndex"
			/>
			<div class="text">
				{{ t('components.setString-operand-parse-timestamp-variable.label') }}
			</div>
			<CustomBox
				id="setString-operand-parse-timestamp-variable"
				v-tip="t('components.setString-operand-parse-timestamp-variable.tip')"
				:ref="registryRef(fieldEls, 'setString-operand-parse-timestamp-variable')"
				v-focus
				type="variable"
				filter="number"
				v-model="form.parseTimestampVariable"
			/>
			<div class="text">
				{{ t('components.setString-operand-parse-timestamp-format.label') }}
			</div>
			<TextBox
				id="setString-operand-parse-timestamp-format"
				v-tip="t('components.setString-operand-parse-timestamp-format.tip')"
				:ref="registryRef(fieldEls, 'setString-operand-parse-timestamp-format')"
				v-model="parseTimestampFormat"
			/>
			<div class="text">{{ t('components.setString-operand-screenshot-width.label') }}</div>
			<NumberBox
				id="setString-operand-screenshot-width"
				v-tip="t('components.setString-operand-screenshot-width.tip')"
				:ref="registryRef(fieldEls, 'setString-operand-screenshot-width')"
				min="64"
				max="7680"
				unit="px"
				v-model="screenshotWidth"
			/>
			<div class="text">{{ t('components.setString-operand-screenshot-height.label') }}</div>
			<NumberBox
				id="setString-operand-screenshot-height"
				v-tip="t('components.setString-operand-screenshot-height.tip')"
				:ref="registryRef(fieldEls, 'setString-operand-screenshot-height')"
				min="64"
				max="7680"
				unit="px"
				v-model="screenshotHeight"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { setupSetStringFields } from '@app/composables/useSetStringFields';
import { createElementRegistry, registryRef } from '@app/utils/element-registry';
import { composableEls } from '@app/composables/element-registry';

// 本组件的控件元素注册表（替代按 id 查 DOM）
const fieldEls = createElementRegistry(composableEls);
import { computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSetStringCommandSchema } from '@app/composables/commands/useSetStringCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import StringVar from '@app/components/common/StringVar.vue';
import TextArea from '@app/components/common/TextArea.vue';
import TextBox from '@app/components/common/TextBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save, writeHandler } = useSetStringCommandSchema();

const commonValue = computed({
	get: () => form.commonValue as string,
	set: (value) => {
		form.commonValue = value;
	}
});

const stringPadStartLength = computed({
	get: () => form.stringPadStartLength as number | string,
	set: (value) => {
		form.stringPadStartLength = value;
	}
});

const stringPadStartPad = computed({
	get: () => form.stringPadStartPad as string,
	set: (value) => {
		form.stringPadStartPad = value;
	}
});

const script = computed({
	get: () => form.script as string,
	set: (value) => {
		form.script = value;
	}
});

const parseTimestampFormat = computed({
	get: () => form.parseTimestampFormat as string,
	set: (value) => {
		form.parseTimestampFormat = value;
	}
});

const screenshotWidth = computed({
	get: () => form.screenshotWidth as number | string,
	set: (value) => {
		form.screenshotWidth = value;
	}
});

const screenshotHeight = computed({
	get: () => form.screenshotHeight as number | string,
	set: (value) => {
		form.screenshotHeight = value;
	}
});

const onWrite = (value: unknown) => {
	writeHandler({ value: value as string });
};

const onConfirm = () => {
	save();
};

onMounted(() => {
	setupSetStringFields(fieldEls);
});
</script>

<style>
/* 不能用 scoped：-confirm/-cancel 等元素由 WindowFrame 内部生成 */
#setString {
	width: 324px;
	height: 242px;
}

#setString-operand-common-value {
	height: 92px;
}

#setString-confirm {
	right: 108px;
	bottom: 10px;
}

#setString-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
