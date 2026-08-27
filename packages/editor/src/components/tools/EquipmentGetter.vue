<template>
	<WindowFrame ref="frame" id="equipmentGetter" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.equipmentGetter.title') }}
				<div class="close"></div></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.equipmentGetter-type.label') }}</div>
			<SelectBox id="equipmentGetter-type" v-model="form.type" />
			<div class="text">{{ t('components.equipmentGetter-actor.label') }}</div>
			<CustomBox id="equipmentGetter-actor" type="actor" v-model="form.actor" />
			<div class="text">{{ t('components.equipmentGetter-slot.label') }}</div>
			<SelectVar id="equipmentGetter-slot" v-model="form.slot" />
			<div class="text">{{ t('components.equipmentGetter-equipmentId.label') }}</div>
			<CustomBox
				id="equipmentGetter-equipmentId"
				type="file"
				filter="equipment"
				v-model="form.equipmentId"
			/>
			<div class="text">{{ t('components.equipmentGetter-variable.label') }}</div>
			<CustomBox
				id="equipmentGetter-variable"
				type="variable"
				filter="object"
				v-model="form.variable"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { EquipmentGetter } from '@app/commands/accessors/equipment-accessor-window.ts';
import { useEquipmentGetterWindow } from '@app/composables/useEquipmentGetterWindow';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectVar from '@app/components/common/SelectVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const equipmentGetter = useEquipmentGetterWindow();
const form = equipmentGetter.form;

const frame = ref<InstanceType<typeof WindowFrame> | null>(null);

const inspector = useInspectorStore();
const local = useLocalStore();

const onConfirm = () => {
	EquipmentGetter?.confirm?.();
};

onMounted(() => {
	const el = frame.value?.root;
	if (el) {
		el.on('closed', () => equipmentGetter.onWindowClosed());
	}
});
</script>
