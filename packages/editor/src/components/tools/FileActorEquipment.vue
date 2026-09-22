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
				id="fileActor-equipment-slot"
				v-tip="t('components.fileActor-equipment-slot.tip')"
				:ref="registryRef(inspectorEls, 'fileActor-equipment-slot')"
				v-focus
				v-model="form.slot"
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

onMounted(() => {});
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
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
