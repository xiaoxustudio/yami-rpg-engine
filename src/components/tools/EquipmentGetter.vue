<template>
	<WindowFrame id="equipmentGetter">
		<TitleBar>Actor<close></close></TitleBar>
		<content-frame>
			<grid-box>
				<text>Type</text><select-box id="equipmentGetter-type" /> <text>Actor</text
				><custom-box id="equipmentGetter-actor" type="actor" /> <text>Slot</text
				><select-var id="equipmentGetter-slot" /> <text>Equipment</text
				><custom-box
					id="equipmentGetter-equipmentId"
					type="file"
					filter="equipment"
				/>
				<text>Variable</text
				><custom-box id="equipmentGetter-variable" type="variable" filter="object" />
			</grid-box>
			<button id="equipmentGetter-confirm" name="confirm">Confirm</button>
			<button id="equipmentGetter-cancel" name="cancel">Cancel</button>
		</content-frame>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
