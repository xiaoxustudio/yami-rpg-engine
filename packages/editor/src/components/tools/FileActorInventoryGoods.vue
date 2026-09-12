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
			<SelectBox id="fileActor-inventory-type"
				v-tip="t('components.fileActor-inventory-type.tip')"
				:ref="registryRef(inspectorEls, 'fileActor-inventory-type')" v-focus v-model="form.type" />
			<div class="text">{{ t('components.fileActor-inventory-item-id.label') }}</div>
			<CustomBox
				id="fileActor-inventory-item-id"
				v-tip="t('components.fileActor-inventory-item-id.tip')"
				:ref="registryRef(inspectorEls, 'fileActor-inventory-item-id')"
				v-focus
				type="file"
				filter="item"
				v-model="form.itemId"
			/>
			<div class="text">{{ t('components.fileActor-inventory-item-quantity.label') }}</div>
			<NumberBox
				id="fileActor-inventory-item-quantity"
				v-tip="t('components.fileActor-inventory-item-quantity.tip')"
				:ref="registryRef(inspectorEls, 'fileActor-inventory-item-quantity')"
				min="1"
				max="10000"
				v-model="form.itemQuantity"
			/>
			<div class="text">{{ t('components.fileActor-inventory-equipment-id.label') }}</div>
			<CustomBox
				id="fileActor-inventory-equipment-id"
				v-tip="t('components.fileActor-inventory-equipment-id.tip')"
				:ref="registryRef(inspectorEls, 'fileActor-inventory-equipment-id')"
				v-focus
				type="file"
				filter="equipment"
				v-model="form.equipmentId"
			/>
			<div class="text">{{ t('components.fileActor-inventory-money.label') }}</div>
			<NumberBox
				id="fileActor-inventory-money"
				v-tip="t('components.fileActor-inventory-money.tip')"
				:ref="registryRef(inspectorEls, 'fileActor-inventory-money')"
				min="1"
				max="100000000"
				v-model="form.money"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { inspectorEls } from '@app/inspector/element-registry.ts';
import { registryRef } from '@app/utils/element-registry';
import { useI18n } from 'vue-i18n';
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

onMounted(() => {});
</script>

<style>
/* 窗口样式迁移：由 Project/css/inspector.css 迁入组件（选择器为全局 id，不能用 scoped） */
#fileActor-inventory-goods {
	width: 324px;
	height: 146px;
}
</style>

