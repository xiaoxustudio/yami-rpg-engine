<template>
		<WindowFrame id="objectGetter">
		<TitleBar>Scene Object<close></close></TitleBar>
		<content-frame>
			<grid-box>
				<text>Type</text><select-box id="objectGetter-type" /> <text>Object</text
				><custom-box id="objectGetter-presetId" type="preset-object" filter="any" />
				<text>Variable</text
				><custom-box id="objectGetter-variable" type="variable" filter="object" />
			</grid-box>
			<button id="objectGetter-confirm" name="confirm">Confirm</button>
			<button id="objectGetter-cancel" name="cancel">Cancel</button>
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
