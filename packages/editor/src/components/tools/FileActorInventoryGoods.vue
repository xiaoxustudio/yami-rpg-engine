<template>
	<WindowFrame
		id="fileActor-inventory-goods"
		buttons-id-prefix="fileActor-inventory"
		@confirm="onConfirm"
	>
		<template #title
			><TitleBar
				>{{ t('components.fileActor-inventory-goods.title') }}
				<div class="close"></div></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.fileActor-inventory-type.label') }}</div>
			<SelectBox
				:label="t('components.fileActor-inventory-type.label')"
				id="fileActor-inventory-type"
				v-tip="t('components.fileActor-inventory-type.tip')"
				ref="typeRef"
				v-focus
				v-model="form.type"
			/>
			<div class="text">{{ t('components.fileActor-inventory-item-id.label') }}</div>
			<CustomBox
				id="fileActor-inventory-item-id"
				v-tip="t('components.fileActor-inventory-item-id.tip')"
				ref="itemIdRef"
				v-focus
				type="file"
				filter="item"
				v-model="form.itemId"
			/>
			<div class="text">{{ t('components.fileActor-inventory-item-quantity.label') }}</div>
			<NumberBox
				:label="t('components.fileActor-inventory-item-quantity.label')"
				id="fileActor-inventory-item-quantity"
				v-tip="t('components.fileActor-inventory-item-quantity.tip')"
				ref="itemQuantityRef"
				min="1"
				max="10000"
				v-model="form.itemQuantity"
			/>
			<div class="text">{{ t('components.fileActor-inventory-equipment-id.label') }}</div>
			<CustomBox
				id="fileActor-inventory-equipment-id"
				v-tip="t('components.fileActor-inventory-equipment-id.tip')"
				ref="equipmentIdRef"
				v-focus
				type="file"
				filter="equipment"
				v-model="form.equipmentId"
			/>
			<div class="text">{{ t('components.fileActor-inventory-money.label') }}</div>
			<NumberBox
				:label="t('components.fileActor-inventory-money.label')"
				id="fileActor-inventory-money"
				v-tip="t('components.fileActor-inventory-money.tip')"
				ref="moneyRef"
				min="1"
				max="100000000"
				v-model="form.money"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { controlRoot } from '@app/composables/control-refs';
import {
	provideFileActorInventory,
	resetFileActorInventory,
	type FileActorInventoryApi
} from '@app/composables/file-actor-tool-bridges';
import { Inspector } from '@app/inspector/inspector.ts';
import { fileActorInventoryForm } from '@app/inspector/file-actor-page.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const form = fileActorInventoryForm;

const onConfirm = () => {
	Inspector?.fileActor?.inventory?.save?.();
};

/**
 * 库存窗口的两件事一次交出：类型候选项 + 按类型开关后面几行。
 * `relate()` 的目标是 DOM 语义，用 `controlRoot(...)` 取根元素。
 */
const typeRef = ref<InstanceType<typeof SelectBox> | null>(null);
const itemIdRef = ref<InstanceType<typeof SelectBox> | null>(null);
const itemQuantityRef = ref<InstanceType<typeof NumberBox> | null>(null);
const equipmentIdRef = ref<InstanceType<typeof SelectBox> | null>(null);
const moneyRef = ref<InstanceType<typeof NumberBox> | null>(null);

const bridgeApi: FileActorInventoryApi = {
	setupTypeRows: () => {
		const type = typeRef.value;
		type?.loadItems([
			{ name: 'Item', value: 'item' },
			{ name: 'Equipment', value: 'equipment' },
			{ name: 'Money', value: 'money' }
		]);
		// enableHiddenMode() 的返回值类型不含 relate，这里按隐藏模式句柄断言一下

		const hidden = type?.enableHiddenMode?.() as { relate?: (groups: unknown[]) => void };
		hidden?.relate?.([
			{
				case: 'item',
				targets: [controlRoot(itemIdRef.value), controlRoot(itemQuantityRef.value)]
			},
			{ case: 'equipment', targets: [controlRoot(equipmentIdRef.value)] },
			{ case: 'money', targets: [controlRoot(moneyRef.value)] }
		]);
	}
};

onMounted(() => {
	provideFileActorInventory(bridgeApi);
	onUnmounted(() => resetFileActorInventory(bridgeApi));
});
</script>

<style>
#fileActor-inventory-goods {
	width: 324px;
	height: 146px;
}
</style>
