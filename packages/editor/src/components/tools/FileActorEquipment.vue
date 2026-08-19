<template>
	<WindowFrame id="fileActor-equipment" @confirm="onConfirm">
		<template #title><TitleBar>{{ t('components.fileActor-equipment.title') }}<div class="close"></div></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">{{ t('components.fileActor-equipment-id.label') }}</div
				><CustomBox id="fileActor-equipment-id" type="file" filter="equipment" />
				<div class="text">{{ t('components.fileActor-equipment-slot.label') }}</div><SelectBox id="fileActor-equipment-slot" />
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { Inspector } from '@app/legacy/inspector/inspector.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const inspector = useInspectorStore();
const local = useLocalStore();

const onConfirm = () => {
	Inspector?.fileActor?.equipments?.save?.();
};

onMounted(() => {


});
</script>
