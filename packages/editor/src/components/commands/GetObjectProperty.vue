<template>
	<WindowFrame
		id="getObjectProperty"
		:ref="registryRef(fieldEls, 'getObjectProperty')"
		@confirm="onConfirm"
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
				:ref="registryRef(fieldEls, 'getObjectProperty-variable')"
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
				:ref="registryRef(fieldEls, 'getObjectProperty-list')"
				v-focus
				v-model="form.properties"
			/>
			<div class="text">{{ t('components.getObjectProperty-save-variable.label') }}</div>
			<CustomBox
				id="getObjectProperty-save-variable"
				:ref="registryRef(fieldEls, 'getObjectProperty-save-variable')"
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
import { createElementRegistry, registryRef } from '@app/utils/element-registry';
import { composableEls } from '@app/composables/element-registry';

const fieldEls = createElementRegistry(composableEls);
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useGetObjectPropertyCommandSchema } from '@app/composables/commands/useGetObjectPropertyCommandSchema';
import { clear } from '@app/utils/element-utils';
import { IndexBind } from '@app/composables/commands/useGetObjectPropertyCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import ParamList from '@app/components/common/ParamList.vue';

const { t } = useI18n();

const { form, save } = useGetObjectPropertyCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	fieldEls.get('getObjectProperty-list')?.bind?.(IndexBind);
	fieldEls.get('getObjectProperty')?.on?.('closed', () => {
		clear(fieldEls.get('getObjectProperty-list'));
	});
});
</script>

<style>
/* 不能用 scoped：-confirm/-cancel 等元素由 WindowFrame 内部生成 */
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
