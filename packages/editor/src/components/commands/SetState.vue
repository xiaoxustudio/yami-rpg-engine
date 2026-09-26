<template>
	<WindowFrame id="setState" :ref="registryRef(fieldEls, 'setState')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setState.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.setState-state.label') }}</div>
			<CustomBox
				id="setState-state"
				:ref="registryRef(fieldEls, 'setState-state')"
				v-tip="t('components.setState-state.tip')"
				v-focus
				type="state"
				v-model="form.state"
			/>
			<div class="text">{{ t('components.setState-operation.label') }}</div>
			<SelectBox
				id="setState-operation"
				v-tip="t('components.setState-operation.tip')"
				:ref="registryRef(fieldEls, 'setState-operation')"
				v-model="form.operation"
			/>
			<div class="text">{{ t('components.setState-time.label') }}</div>
			<NumberVar
				id="setState-time"
				:ref="registryRef(fieldEls, 'setState-time')"
				v-tip="t('components.setState-time.tip')"
				min="0"
				max="36000000"
				unit="ms"
				v-model="form.time"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useLocalizedOptions } from '@app/composables/useLocalizedOptions';
import { createElementRegistry, registryRef } from '@app/utils/element-registry';
import { composableEls } from '@app/composables/element-registry';

// 本组件的控件元素注册表（替代按 id 查 DOM）
const fieldEls = createElementRegistry(composableEls);
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSetStateCommandSchema } from '@app/composables/commands/useSetStateCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useSetStateCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	useLocalizedOptions(
		'setState-operation',
		['set-time', 'increase-time', 'decrease-time'],
		(items) => fieldEls.get('setState-operation')?.loadItems?.(items)
	);
});
</script>

<style>
/* 不能用 scoped：-confirm/-cancel 等元素由 WindowFrame 内部生成 */
#setState {
	width: 324px;
	height: 146px;
}

#setState-confirm {
	right: 108px;
	bottom: 10px;
}

#setState-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
