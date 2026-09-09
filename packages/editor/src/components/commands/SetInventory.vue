<template>
	<WindowFrame id="setInventory" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setInventory.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Actor</div>
			<CustomBox id="setInventory-actor" v-focus type="actor" v-model="form.actor" />
			<div class="text">Operation</div>
			<SelectBox id="setInventory-operation" v-model="form.operation" />
			<div class="text">Money</div>
			<NumberVar id="setInventory-money" min="1" max="100000000" v-model="form.money" />
			<div class="text">Item</div>
			<FileVar id="setInventory-itemId" v-focus type="file" filter="item" v-model="form.itemId" />
			<div class="text">Quantity</div>
			<NumberVar id="setInventory-quantity" min="1" max="10000" v-model="form.quantity" />
			<div class="text">Equipment</div>
			<FileVar
				id="setInventory-equipmentId"
				v-focus
				type="file"
				filter="equipment"
				v-model="form.equipmentId"
			/>
			<div class="text">Equipment</div>
			<CustomBox id="setInventory-equipment" type="equipment" v-model="form.equipment" />
			<div class="text">Order A</div>
			<NumberVar id="setInventory-order1" min="0" max="10000" v-model="form.order1" />
			<div class="text">Order B</div>
			<NumberVar id="setInventory-order2" min="0" max="10000" v-model="form.order2" />
			<div class="text">Global Actor</div>
			<CustomBox id="setInventory-refActor" type="actor" v-model="form.refActor" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSetInventoryCommandSchema } from '@app/composables/commands/useSetInventoryCommandSchema';
import { $ } from '@app/utils/dom';
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
	$('#setInventory-operation')?.loadItems?.([
		{
			name: t('command.setInventory.increase-money') || 'Increase Money',
			value: 'increase-money'
		},
		{
			name: t('command.setInventory.decrease-money') || 'Decrease Money',
			value: 'decrease-money'
		},
		{
			name: t('command.setInventory.increase-items') || 'Increase Items',
			value: 'increase-items'
		},
		{
			name: t('command.setInventory.decrease-items') || 'Decrease Items',
			value: 'decrease-items'
		},
		{
			name: t('command.setInventory.gain-equipment') || 'Gain Equipment',
			value: 'gain-equipment'
		},
		{
			name: t('command.setInventory.lose-equipment') || 'Lose Equipment',
			value: 'lose-equipment'
		},
		{
			name: t('command.setInventory.gain-equipment-instance') || 'Gain Equipment',
			value: 'gain-equipment-instance'
		},
		{
			name: t('command.setInventory.lose-equipment-instance') || 'Lose Equipment',
			value: 'lose-equipment-instance'
		},
		{ name: t('command.setInventory.swap') || 'Swap Order of Items', value: 'swap' },
		{ name: t('command.setInventory.sort') || 'Sort Simply', value: 'sort' },
		{ name: t('command.setInventory.sort-by-order') || 'Sort by Filename', value: 'sort-by-order' },
		{
			name: t('command.setInventory.reference') || "Use Global Actor's Inventory",
			value: 'reference'
		},
		{ name: t('command.setInventory.dereference') || 'Restore Inventory', value: 'dereference' },
		{ name: t('command.setInventory.reset') || 'Reset', value: 'reset' }
	]);
	$('#setInventory-operation')
		?.enableHiddenMode?.()
		?.relate?.([
			{
				case: ['increase-money', 'decrease-money'],
				targets: [$('#setInventory-money')]
			},
			{
				case: ['increase-items', 'decrease-items'],
				targets: [$('#setInventory-itemId'), $('#setInventory-quantity')]
			},
			{
				case: ['gain-equipment', 'lose-equipment'],
				targets: [$('#setInventory-equipmentId')]
			},
			{
				case: ['gain-equipment-instance', 'lose-equipment-instance'],
				targets: [$('#setInventory-equipment')]
			},
			{
				case: 'swap',
				targets: [$('#setInventory-order1'), $('#setInventory-order2')]
			},
			{ case: 'reference', targets: [$('#setInventory-refActor')] }
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
