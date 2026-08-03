<template>
	<WindowFrame id="condition">
		<TitleBar>Condition<div class="close" /></TitleBar>
		<div class="content-frame">
			<div class="grid-box">
				<text>Condition Type</text><SelectBox id="condition-type" />
			<text>Variable</text
			><CustomBox id="condition-key" type="global-variable" filter="all" />
			<text>Operation</text><SelectBox id="condition-boolean-operation" />
			<text>Boolean</text><SelectBox id="condition-boolean-value" />
			<text>Operation</text><SelectBox id="condition-number-operation" />
				<text>Number</text
				><NumberBox
					id="condition-number-value"
					min="-1000000000"
					max="1000000000"
					decimals="10"
				/>
				<text>Operation</text><SelectBox id="condition-string-operation" />
				<text>String</text><TextArea id="condition-string-value" />
			</div>
			<button id="condition-confirm" name="confirm">Confirm</button>
			<button id="condition-cancel" name="cancel">Cancel</button>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import TextArea from '@app/components/common/TextArea.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
