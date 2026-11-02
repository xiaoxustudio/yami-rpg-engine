<template>
	<WindowFrame
		id="getObjectProperty"
		:ref="controlRef('getObjectProperty')"
		@confirm="onConfirm"
		@closed="onClosed"
	>
		<template #title
			><TitleBar
				>{{ t('components.getObjectProperty.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.getObjectProperty-variable.label') }}</div>
			<CustomBox
				id="getObjectProperty-variable"
				:ref="controlRef('getObjectProperty-variable')"
				v-tip="t('components.getObjectProperty-variable.tip')"
				v-focus
				type="variable"
				filter="object"
				v-model="form.variable"
			/>
			<div class="text">{{ t('components.getObjectProperty-list.label') }}</div>
			<ParamList
				id="getObjectProperty-list"
				v-tip="t('components.getObjectProperty-list.tip')"
				:ref="controlRef('getObjectProperty-list')"
				v-focus
				v-model="form.properties"
			/>
			<div class="text">{{ t('components.getObjectProperty-save-variable.label') }}</div>
			<CustomBox
				id="getObjectProperty-save-variable"
				:ref="controlRef('getObjectProperty-save-variable')"
				v-tip="t('components.getObjectProperty-save-variable.tip')"
				v-focus
				type="variable"
				filter="object"
				v-model="form.saveVariable"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useGetObjectPropertyCommandSchema } from '@app/composables/commands/useGetObjectPropertyCommandSchema';
import { clear } from '@app/utils/element-utils';
import { IndexBind } from '@app/composables/commands/useGetObjectPropertyCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import ParamList from '@app/components/common/ParamList.vue';
import { controlRoot, useControlRefs } from '@app/composables/control-refs';

/** 控件 id 联合：模板与脚本共用，拼错在 tsc / vue-tsc 就红。 */
type Id =
	| 'getObjectProperty'
	| 'getObjectProperty-list'
	| 'getObjectProperty-save-variable'
	| 'getObjectProperty-variable';

const { controls, controlRef } = useControlRefs<Id>();

const { t } = useI18n();

const { form, save } = useGetObjectPropertyCommandSchema();

const onConfirm = () => {
	save();
};

/** 窗口关闭时清空列表。 */
const onClosed = () => {
	clear(controlRoot(controls['getObjectProperty-list']));
};

onMounted(() => {
	controls['getObjectProperty-list']?.bind?.(IndexBind);
});
</script>

<style>
#getObjectProperty {
	width: 324px;
	height: 220px;
}

#getObjectProperty-list {
	height: 102px;
}

#getObjectProperty-confirm {
	right: 108px;
	bottom: 10px;
}

#getObjectProperty-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
