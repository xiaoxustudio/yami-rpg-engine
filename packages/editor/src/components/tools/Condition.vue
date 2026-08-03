<template>
	<WindowFrame id="condition">
		<TitleBar>Condition<div class="close" /></TitleBar>
		<div class="content-frame">
			<div class="grid-box">
				<div class="text">Condition Type</div><SelectBox id="condition-type" />
			<div class="text">Variable</div
			><CustomBox id="condition-key" type="global-variable" filter="all" />
			<div class="text">Operation</div><SelectBox id="condition-boolean-operation" />
			<div class="text">Boolean</div><SelectBox id="condition-boolean-value" />
			<div class="text">Operation</div><SelectBox id="condition-number-operation" />
				<div class="text">Number</div
				><NumberBox
					id="condition-number-value"
					min="-1000000000"
					max="1000000000"
					decimals="10"
				/>
				<div class="text">Operation</div><SelectBox id="condition-string-operation" />
				<div class="text">String</div><TextArea id="condition-string-value" />
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
