<template>
	<WindowFrame
		id="setObjectProperty"
		:ref="registryRef(fieldEls, 'setObjectProperty')"
		@confirm="onConfirm"
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
				:ref="registryRef(fieldEls, 'setObjectProperty-variable')"
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
				:ref="registryRef(fieldEls, 'setObjectProperty-list')"
				v-focus
				v-model="form.list"
			/>
			<div class="text">{{ t('components.setObjectProperty-value-variable.label') }}</div>
			<CustomBox
				id="setObjectProperty-value-variable"
				:ref="registryRef(fieldEls, 'setObjectProperty-value-variable')"
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
import { createElementRegistry, registryRef } from '@app/utils/element-registry';
import { composableEls } from '@app/composables/element-registry';

const fieldEls = createElementRegistry(composableEls);
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

const { t } = useI18n();

const { form, save } = useSetObjectPropertyCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	fieldEls.get('setObjectProperty-list')?.bind?.(IndexBind);
	fieldEls.get('setObjectProperty')?.on?.('closed', () => {
		clear(fieldEls.get('setObjectProperty-list'));
	});
});
</script>

<style>
/* 不能用 scoped：-confirm/-cancel 等元素由 WindowFrame 内部生成 */
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
