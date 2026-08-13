<template>
		<WindowFrame id="object-attribute" @confirm="onConfirm">
		<template #title><TitleBar>Attribute<div class="close"></div></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Key</div
				><SelectBox id="object-attribute-key" @write="onKeyWrite" /> <div class="text">Boolean</div
				><SelectBox id="object-attribute-boolean-value" /> <div class="text">Number</div
				><NumberBox
					id="object-attribute-number-value"
					min="-1000000000"
					max="1000000000"
					decimals="6"
				/>
				<div class="text">String</div
				><TextArea id="object-attribute-string-value" menu="tag-localization" />
				<div class="text">Option</div><SelectBox id="object-attribute-enum-value" />
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import NumberBox from '@app/components/common/NumberBox.vue';
import TextArea from '@app/components/common/TextArea.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import { AttributeListInterface } from '@/tools/property-list';

const inspector = useInspectorStore();
const local = useLocalStore();

const onKeyWrite = (value: unknown) => {
	AttributeListInterface?.keyWrite?.({ value });
};
const onConfirm = () => {
	AttributeListInterface?.target?.save?.();
};

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
