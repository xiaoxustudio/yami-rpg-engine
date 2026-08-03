<template>
		<WindowFrame id="object-attribute">
		<TitleBar>Attribute<div class="close"></div></TitleBar>
		<div class="content-frame">
			<div class="grid-box">
				<text>Key</text><SelectBox id="object-attribute-key" /> <text>Boolean</text
				><SelectBox id="object-attribute-boolean-value" /> <text>Number</text
				><NumberBox
					id="object-attribute-number-value"
					min="-1000000000"
					max="1000000000"
					decimals="6"
				/>
				<text>String</text
				><TextArea id="object-attribute-string-value" menu="tag-localization" />
				<text>Option</text><SelectBox id="object-attribute-enum-value" />
			</div>
			<button id="object-attribute-confirm" name="confirm">Confirm</button>
			<button id="object-attribute-cancel" name="cancel">Cancel</button>
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

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
