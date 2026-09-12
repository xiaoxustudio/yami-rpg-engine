<template>
	<WindowFrame id="setItem" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setItem.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.setItem-item.label') }}</div>
			<CustomBox id="setItem-item"
				v-tip="t('components.setItem-item.tip')" v-focus type="item" v-model="form.item" />
			<div class="text">{{ t('components.setItem-operation.label') }}</div>
			<SelectBox id="setItem-operation"
				v-tip="t('components.setItem-operation.tip')"
				:ref="registryRef(fieldEls, 'setItem-operation')" v-model="form.operation" />
			<div class="text">{{ t('components.setItem-quantity.label') }}</div>
			<NumberVar id="setItem-quantity"
				v-tip="t('components.setItem-quantity.tip')" min="1" max="10000" v-model="form.quantity" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { createElementRegistry, registryRef } from '@app/utils/element-registry';

// P5b 批次 4：本组件的控件元素注册表（替代按 id 查 DOM）
const fieldEls = createElementRegistry();
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSetItemCommandSchema } from '@app/composables/commands/useSetItemCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useSetItemCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	fieldEls.get('setItem-operation')?.loadItems?.([
		{ name: 'Increase', value: 'increase' },
		{ name: 'Decrease', value: 'decrease' }
	]);
});
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
#setItem {
	width: 324px;
	height: 146px;
}

#setItem-confirm {
	right: 108px;
	bottom: 10px;
}

#setItem-cancel {
	right: 10px;
	bottom: 10px;
}

</style>
