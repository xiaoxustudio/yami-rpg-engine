<template>
	<WindowFrame
		id="setInventory"
		:ref="registryRef(fieldEls, 'setInventory')"
		@confirm="onConfirm"
	>
		<template #title
			><TitleBar
				>{{ t('components.setInventory.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.setInventory-actor.label') }}</div>
			<CustomBox
				id="setInventory-actor"
				:ref="registryRef(fieldEls, 'setInventory-actor')"
				v-tip="t('components.setInventory-actor.tip')"
				v-focus
				type="actor"
				v-model="form.actor"
			/>
			<div class="text">{{ t('components.setInventory-operation.label') }}</div>
			<SelectBox
				id="setInventory-operation"
				v-tip="t('components.setInventory-operation.tip')"
				:ref="registryRef(fieldEls, 'setInventory-operation')"
				v-model="form.operation"
			/>
			<div class="text">{{ t('components.setInventory-money.label') }}</div>
			<NumberVar
				id="setInventory-money"
				v-tip="t('components.setInventory-money.tip')"
				:ref="registryRef(fieldEls, 'setInventory-money')"
				min="1"
				max="100000000"
				v-model="form.money"
			/>
			<div class="text">{{ t('components.setInventory-itemId.label') }}</div>
			<FileVar
				id="setInventory-itemId"
				v-tip="t('components.setInventory-itemId.tip')"
				:ref="registryRef(fieldEls, 'setInventory-itemId')"
				v-focus
				type="file"
				filter="item"
				v-model="form.itemId"
			/>
			<div class="text">{{ t('components.setInventory-quantity.label') }}</div>
			<NumberVar
				id="setInventory-quantity"
				v-tip="t('components.setInventory-quantity.tip')"
				:ref="registryRef(fieldEls, 'setInventory-quantity')"
				min="1"
				max="10000"
				v-model="form.quantity"
			/>
			<div class="text">{{ t('components.setInventory-equipmentId.label') }}</div>
			<FileVar
				id="setInventory-equipmentId"
				v-tip="t('components.setInventory-equipmentId.tip')"
				:ref="registryRef(fieldEls, 'setInventory-equipmentId')"
				v-focus
				type="file"
				filter="equipment"
				v-model="form.equipmentId"
			/>
			<div class="text">{{ t('components.setInventory-equipment.label') }}</div>
			<CustomBox
				id="setInventory-equipment"
				v-tip="t('components.setInventory-equipment.tip')"
				:ref="registryRef(fieldEls, 'setInventory-equipment')"
				type="equipment"
				v-model="form.equipment"
			/>
			<div class="text">{{ t('components.setInventory-order1.label') }}</div>
			<NumberVar
				id="setInventory-order1"
				v-tip="t('components.setInventory-order1.tip')"
				:ref="registryRef(fieldEls, 'setInventory-order1')"
				min="0"
				max="10000"
				v-model="form.order1"
			/>
			<div class="text">{{ t('components.setInventory-order2.label') }}</div>
			<NumberVar
				id="setInventory-order2"
				v-tip="t('components.setInventory-order2.tip')"
				:ref="registryRef(fieldEls, 'setInventory-order2')"
				min="0"
				max="10000"
				v-model="form.order2"
			/>
			<div class="text">{{ t('components.setInventory-refActor.label') }}</div>
			<CustomBox
				id="setInventory-refActor"
				v-tip="t('components.setInventory-refActor.tip')"
				:ref="registryRef(fieldEls, 'setInventory-refActor')"
				type="actor"
				v-model="form.refActor"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useLocalizedOptions } from '@app/composables/useLocalizedOptions';
import { createElementRegistry, registryRef } from '@app/utils/element-registry';
import { composableEls } from '@app/composables/element-registry';

// P5b 批次 4：本组件的控件元素注册表（替代按 id 查 DOM）
const fieldEls = createElementRegistry(composableEls);
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSetInventoryCommandSchema } from '@app/composables/commands/useSetInventoryCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import FileVar from '@app/components/common/FileVar.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useSetInventoryCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	useLocalizedOptions(
		'setInventory-operation',
		[
			'increase-money',
			'decrease-money',
			'increase-items',
			'decrease-items',
			'gain-equipment',
			'lose-equipment',
			'gain-equipment-instance',
			'lose-equipment-instance',
			'swap',
			'sort',
			'sort-by-order',
			'reference',
			'dereference',
			'reset'
		],
		(items) => fieldEls.get('setInventory-operation')?.loadItems?.(items),
		{
			'increase-money': 'command.setInventory.increase-money',
			'decrease-money': 'command.setInventory.decrease-money',
			'increase-items': 'command.setInventory.increase-items',
			'decrease-items': 'command.setInventory.decrease-items',
			'gain-equipment': 'command.setInventory.gain-equipment',
			'lose-equipment': 'command.setInventory.lose-equipment',
			'gain-equipment-instance': 'command.setInventory.gain-equipment-instance',
			'lose-equipment-instance': 'command.setInventory.lose-equipment-instance',
			swap: 'command.setInventory.swap',
			sort: 'command.setInventory.sort',
			'sort-by-order': 'command.setInventory.sort-by-order',
			reference: 'command.setInventory.reference',
			dereference: 'command.setInventory.dereference',
			reset: 'command.setInventory.reset'
		}
	);
	fieldEls
		.get('setInventory-operation')
		?.enableHiddenMode?.()
		?.relate?.([
			{
				case: ['increase-money', 'decrease-money'],
				targets: [fieldEls.get('setInventory-money')]
			},
			{
				case: ['increase-items', 'decrease-items'],
				targets: [
					fieldEls.get('setInventory-itemId'),
					fieldEls.get('setInventory-quantity')
				]
			},
			{
				case: ['gain-equipment', 'lose-equipment'],
				targets: [fieldEls.get('setInventory-equipmentId')]
			},
			{
				case: ['gain-equipment-instance', 'lose-equipment-instance'],
				targets: [fieldEls.get('setInventory-equipment')]
			},
			{
				case: 'swap',
				targets: [fieldEls.get('setInventory-order1'), fieldEls.get('setInventory-order2')]
			},
			{ case: 'reference', targets: [fieldEls.get('setInventory-refActor')] }
		]);
});
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
#setInventory {
	width: 324px;
	height: 170px;
}

#setInventory-confirm {
	right: 108px;
	bottom: 10px;
}

#setInventory-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
