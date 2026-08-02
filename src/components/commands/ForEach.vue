<template>
<WindowFrame id="forEach">
	<TitleBar>For Each<close /></TitleBar>
	<content-frame>
		<grid-box>
			<text>Data</text><SelectBox id="forEach-data" /> <text>List Variable</text
			><CustomBox id="forEach-list" type="variable" filter="object" />
			<text>Actor</text><CustomBox id="forEach-actor" type="actor" />
			<text>Parent Element</text><CustomBox id="forEach-element" type="element" />
			<text>Attribute Group</text
			><CustomBox id="forEach-attribute-groupId" type="attribute-group" />
			<text>Enum Group</text
			><CustomBox id="forEach-enum-groupId" type="enum-group" />
			<text>Write to Variable</text
			><CustomBox id="forEach-variable" type="variable" filter="object" />
			<text>Write Save Index</text
			><CustomBox id="forEach-saveIndex" type="variable" filter="number" />
			<text>Touch Id</text
			><CustomBox id="forEach-touchId" type="variable" filter="number" />
		</grid-box>
		<button id="forEach-confirm" name="confirm">Confirm</button>
		<button id="forEach-cancel" name="cancel">Cancel</button>
	</content-frame>
</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
