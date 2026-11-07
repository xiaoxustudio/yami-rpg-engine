<template>
	<WindowFrame id="setBoolean" :ref="controlRef('setBoolean')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setBoolean.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.setBoolean-variable.label') }}</div>
			<CustomBox
				id="setBoolean-variable"
				:ref="controlRef('setBoolean-variable')"
				v-tip="t('components.setBoolean-variable.tip')"
				v-focus
				type="variable"
				filter="writable-boolean"
				v-model="form.variable"
			/>
			<div class="text">{{ t('components.setBoolean-operation.label') }}</div>
			<SelectBox
				:label="t('components.setBoolean-operation.label')"
				id="setBoolean-operation"
				:ref="controlRef('setBoolean-operation')"
				v-model="form.operation"
			/>
			<div class="text">{{ t('components.setBoolean-operand-type.label') }}</div>
			<SelectBox
				:label="t('components.setBoolean-operand-type.label')"
				id="setBoolean-operand-type"
				v-tip="t('components.setBoolean-operand-type.tip')"
				:ref="controlRef('setBoolean-operand-type')"
				v-model="form['operand-type']"
				@write="onWrite"
			/>
			<div class="text">{{ t('components.setBoolean-constant-value.label') }}</div>
			<SelectBox
				:label="t('components.setBoolean-constant-value.label')"
				id="setBoolean-constant-value"
				v-tip="t('components.setBoolean-constant-value.tip')"
				:ref="controlRef('setBoolean-constant-value')"
				v-model="form['constant-value']"
			/>
			<div class="text">{{ t('components.setBoolean-common-variable.label') }}</div>
			<CustomBox
				id="setBoolean-common-variable"
				v-tip="t('components.setBoolean-common-variable.tip')"
				:ref="controlRef('setBoolean-common-variable')"
				v-focus
				type="variable"
				filter="all"
				v-model="form['common-variable']"
			/>
			<div class="text">{{ t('components.setBoolean-list-index.label') }}</div>
			<NumberVar
				id="setBoolean-list-index"
				v-tip="t('components.setBoolean-list-index.tip')"
				:ref="controlRef('setBoolean-list-index')"
				min="0"
				max="1000000000"
				v-model="form['list-index']"
			/>
			<div class="text">{{ t('components.setBoolean-parameter-key.label') }}</div>
			<StringVar
				id="setBoolean-parameter-key"
				v-tip="t('components.setBoolean-parameter-key.tip')"
				:ref="controlRef('setBoolean-parameter-key')"
				v-focus
				v-model="form['parameter-key']"
			/>
			<div class="text">{{ t('components.setBoolean-script.label') }}</div>
			<TextBox
				:label="t('components.setBoolean-script.label')"
				id="setBoolean-script"
				v-tip="t('components.setBoolean-script.tip')"
				:ref="controlRef('setBoolean-script')"
				v-focus
				v-model="script"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { setupSetBooleanFields } from '@app/composables/useSetBooleanFields';

import { computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSetBooleanCommandSchema } from '@app/composables/commands/useSetBooleanCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import StringVar from '@app/components/common/StringVar.vue';
import TextBox from '@app/components/common/TextBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import { useControlRefs } from '@app/composables/control-refs';

/** 控件 id 联合：模板与脚本共用，拼错在 tsc / vue-tsc 就红。 */
type Id =
	| 'setBoolean'
	| 'setBoolean-common-variable'
	| 'setBoolean-constant-value'
	| 'setBoolean-list-index'
	| 'setBoolean-operand-type'
	| 'setBoolean-operation'
	| 'setBoolean-parameter-key'
	| 'setBoolean-script'
	| 'setBoolean-variable';

const { controls, controlRef } = useControlRefs<Id>();

const { t } = useI18n();

const { form, save, writeHandler } = useSetBooleanCommandSchema({ controls: () => controls });

const script = computed({
	get: () => form.script as string,
	set: (value) => {
		form.script = value;
	}
});

const onWrite = (value: unknown) => {
	writeHandler({ value: value as string });
};

const onConfirm = () => {
	save();
};

onMounted(() => {
	setupSetBooleanFields(controls);
});
</script>

<style>
#setBoolean {
	width: 324px;
	height: 194px;
}

#setBoolean-confirm {
	right: 108px;
	bottom: 10px;
}

#setBoolean-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
