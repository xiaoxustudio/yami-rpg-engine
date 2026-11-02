<template>
	<WindowFrame id="setItem" :ref="controlRef('setItem')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setItem.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.setItem-item.label') }}</div>
			<CustomBox
				id="setItem-item"
				:ref="controlRef('setItem-item')"
				v-tip="t('components.setItem-item.tip')"
				v-focus
				type="item"
				v-model="form.item"
			/>
			<div class="text">{{ t('components.setItem-operation.label') }}</div>
			<SelectBox
				:label="t('components.setItem-operation.label')"
				id="setItem-operation"
				v-tip="t('components.setItem-operation.tip')"
				:ref="controlRef('setItem-operation')"
				v-model="form.operation"
			/>
			<div class="text">{{ t('components.setItem-quantity.label') }}</div>
			<NumberVar
				id="setItem-quantity"
				:ref="controlRef('setItem-quantity')"
				v-tip="t('components.setItem-quantity.tip')"
				min="1"
				max="10000"
				v-model="form.quantity"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useLocalizedOptions } from '@app/composables/useLocalizedOptions';
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSetItemCommandSchema } from '@app/composables/commands/useSetItemCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import { useControlRefs } from '@app/composables/control-refs';

/** 控件 id 联合：模板与脚本共用，拼错在 tsc / vue-tsc 就红。 */
type Id = 'setItem' | 'setItem-item' | 'setItem-operation' | 'setItem-quantity';

const { controls, controlRef } = useControlRefs<Id>();

const { t } = useI18n();

const { form, save } = useSetItemCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	useLocalizedOptions('setItem-operation', ['increase', 'decrease'], (items) =>
		controls['setItem-operation']?.loadItems?.(items)
	);
});
</script>

<style>
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
