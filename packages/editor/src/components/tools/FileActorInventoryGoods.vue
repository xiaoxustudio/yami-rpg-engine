<template>
	<WindowFrame id="fileActor-inventory-goods" buttons-id-prefix="fileActor-inventory" @confirm="onConfirm">
		<template #title><TitleBar>{{ t('components.fileActor-inventory-goods.title') }}<div class="close"></div></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">{{ t('components.fileActor-inventory-type.label') }}</div><SelectBox id="fileActor-inventory-type" />
				<div class="text">{{ t('components.fileActor-inventory-item-id.label') }}</div
				><CustomBox id="fileActor-inventory-item-id" type="file" filter="item" />
				<div class="text">{{ t('components.fileActor-inventory-item-quantity.label') }}</div
				><NumberBox id="fileActor-inventory-item-quantity" min="1" max="10000" />
				<div class="text">{{ t('components.fileActor-inventory-equipment-id.label') }}</div
				><CustomBox
					id="fileActor-inventory-equipment-id"
					type="file"
					filter="equipment"
				/>
				<div class="text">{{ t('components.fileActor-inventory-money.label') }}</div
				><NumberBox id="fileActor-inventory-money" min="1" max="100000000" />
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
import NumberBox from '@app/components/common/NumberBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const inspector = useInspectorStore();
const local = useLocalStore();

const onConfirm = () => {
	Inspector?.fileActor?.inventory?.save?.();
};

onMounted(() => {


});
</script>
