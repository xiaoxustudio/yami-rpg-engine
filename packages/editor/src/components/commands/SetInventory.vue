<template>
	<WindowFrame id="setInventory" :ref="controlRef('setInventory')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setInventory.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.setInventory-actor.label') }}</div>
			<CustomBox
				id="setInventory-actor"
				:ref="controlRef('setInventory-actor')"
				v-tip="t('components.setInventory-actor.tip')"
				v-focus
				type="actor"
				v-model="form.actor"
			/>
			<div class="text">{{ t('components.setInventory-operation.label') }}</div>
			<SelectBox
				:label="t('components.setInventory-operation.label')"
				id="setInventory-operation"
				v-tip="t('components.setInventory-operation.tip')"
				:ref="controlRef('setInventory-operation')"
				v-model="form.operation"
			/>
			<div class="text">{{ t('components.setInventory-money.label') }}</div>
			<NumberVar
				id="setInventory-money"
				v-tip="t('components.setInventory-money.tip')"
				:ref="controlRef('setInventory-money')"
				min="1"
				max="100000000"
				v-model="form.money"
			/>
			<div class="text">{{ t('components.setInventory-itemId.label') }}</div>
			<FileVar
				id="setInventory-itemId"
				v-tip="t('components.setInventory-itemId.tip')"
				:ref="controlRef('setInventory-itemId')"
				v-focus
				type="file"
				filter="item"
				v-model="form.itemId"
			/>
			<div class="text">{{ t('components.setInventory-quantity.label') }}</div>
			<NumberVar
				id="setInventory-quantity"
				v-tip="t('components.setInventory-quantity.tip')"
				:ref="controlRef('setInventory-quantity')"
				min="1"
				max="10000"
				v-model="form.quantity"
			/>
			<div class="text">{{ t('components.setInventory-equipmentId.label') }}</div>
			<FileVar
				id="setInventory-equipmentId"
				v-tip="t('components.setInventory-equipmentId.tip')"
				:ref="controlRef('setInventory-equipmentId')"
				v-focus
				type="file"
				filter="equipment"
				v-model="form.equipmentId"
			/>
			<div class="text">{{ t('components.setInventory-equipment.label') }}</div>
			<CustomBox
				id="setInventory-equipment"
				v-tip="t('components.setInventory-equipment.tip')"
				:ref="controlRef('setInventory-equipment')"
				type="equipment"
				v-model="form.equipment"
			/>
			<div class="text">{{ t('components.setInventory-order1.label') }}</div>
			<NumberVar
				id="setInventory-order1"
				v-tip="t('components.setInventory-order1.tip')"
				:ref="controlRef('setInventory-order1')"
				min="0"
				max="10000"
				v-model="form.order1"
			/>
			<div class="text">{{ t('components.setInventory-order2.label') }}</div>
			<NumberVar
				id="setInventory-order2"
				v-tip="t('components.setInventory-order2.tip')"
				:ref="controlRef('setInventory-order2')"
				min="0"
				max="10000"
				v-model="form.order2"
			/>
			<div class="text">{{ t('components.setInventory-refActor.label') }}</div>
			<CustomBox
				id="setInventory-refActor"
				v-tip="t('components.setInventory-refActor.tip')"
				:ref="controlRef('setInventory-refActor')"
				type="actor"
				v-model="form.refActor"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useLocalizedOptions } from '@app/composables/useLocalizedOptions';

import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSetInventoryCommandSchema } from '@app/composables/commands/useSetInventoryCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import FileVar from '@app/components/common/FileVar.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import { controlRoot, useControlRefs } from '@app/composables/control-refs';

/** 控件 id 联合：模板与脚本共用，拼错在 tsc / vue-tsc 就红。 */
type Id =
	| 'setInventory'
	| 'setInventory-actor'
	| 'setInventory-equipment'
	| 'setInventory-equipmentId'
	| 'setInventory-itemId'
	| 'setInventory-money'
	| 'setInventory-operation'
	| 'setInventory-order1'
	| 'setInventory-order2'
	| 'setInventory-quantity'
	| 'setInventory-refActor';

const { controls, controlRef } = useControlRefs<Id>();

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
		(items) => controls['setInventory-operation']?.loadItems?.(items),
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
	controls['setInventory-operation']?.enableHiddenMode?.();
	controls['setInventory-operation']?.relate?.([
		{
			case: ['increase-money', 'decrease-money'],
			targets: [controlRoot(controls['setInventory-money'])]
		},
		{
			case: ['increase-items', 'decrease-items'],
			targets: [
				controlRoot(controls['setInventory-itemId']),
				controlRoot(controls['setInventory-quantity'])
			]
		},
		{
			case: ['gain-equipment', 'lose-equipment'],
			targets: [controlRoot(controls['setInventory-equipmentId'])]
		},
		{
			case: ['gain-equipment-instance', 'lose-equipment-instance'],
			targets: [controlRoot(controls['setInventory-equipment'])]
		},
		{
			case: 'swap',
			targets: [
				controlRoot(controls['setInventory-order1']),
				controlRoot(controls['setInventory-order2'])
			]
		},
		{ case: 'reference', targets: [controlRoot(controls['setInventory-refActor'])] }
	]);
});
</script>

<style>
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
