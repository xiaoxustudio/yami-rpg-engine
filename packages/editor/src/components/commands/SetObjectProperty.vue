<template>
	<WindowFrame
		id="setObjectProperty"
		:ref="controlRef('setObjectProperty')"
		@confirm="onConfirm"
		@closed="onClosed"
	>
		<template #title
			><TitleBar
				>{{ t('components.setObjectProperty.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.setObjectProperty-variable.label') }}</div>
			<CustomBox
				id="setObjectProperty-variable"
				:ref="controlRef('setObjectProperty-variable')"
				v-tip="t('components.setObjectProperty-variable.tip')"
				v-focus
				type="variable"
				filter="object"
				v-model="form.variable"
			/>
			<div class="text">{{ t('components.setObjectProperty-list.label') }}</div>
			<ParamList
				id="setObjectProperty-list"
				v-tip="t('components.setObjectProperty-list.tip')"
				:ref="controlRef('setObjectProperty-list')"
				v-focus
				v-model="form.list"
			/>
			<div class="text">{{ t('components.setObjectProperty-value-variable.label') }}</div>
			<CustomBox
				id="setObjectProperty-value-variable"
				:ref="controlRef('setObjectProperty-value-variable')"
				v-tip="t('components.setObjectProperty-value-variable.tip')"
				v-focus
				type="variable"
				filter="all"
				v-model="form.valueVariable"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import {
	useSetObjectPropertyCommandSchema,
	IndexBind
} from '@app/composables/commands/useGetObjectPropertyCommandSchema';
import { clear } from '@app/utils/element-utils';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import ParamList from '@app/components/common/ParamList.vue';
import { controlRoot, useControlRefs } from '@app/composables/control-refs';

/** 控件 id 联合：模板与脚本共用，拼错在 tsc / vue-tsc 就红。 */
type Id =
	| 'setObjectProperty'
	| 'setObjectProperty-list'
	| 'setObjectProperty-value-variable'
	| 'setObjectProperty-variable';

const { controls, controlRef } = useControlRefs<Id>();

const { t } = useI18n();

const { form, save } = useSetObjectPropertyCommandSchema();

const onConfirm = () => {
	save();
};

/** 窗口关闭时清理。 */
const onClosed = () => {
	clear(controlRoot(controls['setObjectProperty-list']));
};

onMounted(() => {
	controls['setObjectProperty-list']?.bind?.(IndexBind);
});
</script>

<style>
#setObjectProperty {
	width: 324px;
	height: 220px;
}

#setObjectProperty-list {
	height: 102px;
}

#setObjectProperty-confirm {
	right: 108px;
	bottom: 10px;
}

#setObjectProperty-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
