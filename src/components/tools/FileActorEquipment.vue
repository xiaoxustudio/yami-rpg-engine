<template>
	<WindowFrame id="fileActor-equipment">
		<TitleBar>Equipment<div class="close"></div></TitleBar>
		<content-frame>
			<grid-box>
				<text>Equipment</text
				><CustomBox id="fileActor-equipment-id" type="file" filter="equipment" />
				<text>Slot</text><SelectBox id="fileActor-equipment-slot" />
			</grid-box>
			<button id="fileActor-equipment-confirm" name="confirm">Confirm</button>
			<button id="fileActor-equipment-cancel" name="cancel">Cancel</button>
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
