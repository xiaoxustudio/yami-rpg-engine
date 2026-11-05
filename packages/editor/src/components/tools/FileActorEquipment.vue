<template>
	<WindowFrame id="fileActor-equipment" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.fileActor-equipment.title') }}
				<div class="close"></div></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.fileActor-equipment-id.label') }}</div>
			<CustomBox
				id="fileActor-equipment-id"
				v-tip="t('components.fileActor-equipment-id.tip')"
				v-focus
				type="file"
				filter="equipment"
				v-model="form.id"
			/>
			<div class="text">{{ t('components.fileActor-equipment-slot.label') }}</div>
			<SelectBox
				:label="t('components.fileActor-equipment-slot.label')"
				id="fileActor-equipment-slot"
				v-tip="t('components.fileActor-equipment-slot.tip')"
				ref="equipmentSlotRef"
				v-focus
				v-model="form.slot"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import {
	provideFileActorEquipment,
	resetFileActorEquipment,
	type FileActorEquipmentApi
} from '@app/composables/file-actor-tool-bridges';
import { Inspector } from '@app/inspector/inspector.ts';
import { fileActorEquipmentForm } from '@app/inspector/file-actor-page.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const form = fileActorEquipmentForm;

const onConfirm = () => {
	Inspector?.fileActor?.equipments?.save?.();
};

/** 这个窗口只负责一件事：给单例把候选项灌进控件。 */
const equipmentSlotRef = ref<InstanceType<typeof SelectBox> | null>(null);

const bridgeApi: FileActorEquipmentApi = {
	loadSlots: (items) => {
		equipmentSlotRef.value?.loadItems(items);
	}
};

onMounted(() => {
	provideFileActorEquipment(bridgeApi);
	onUnmounted(() => resetFileActorEquipment(bridgeApi));
});
</script>

<style>
#fileActor-equipment {
	width: 324px;
	height: 122px;
}

#fileActor-equipment-confirm {
	right: 108px;
	bottom: 10px;
}

#fileActor-equipment-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
