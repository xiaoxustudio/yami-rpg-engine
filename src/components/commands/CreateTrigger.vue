<template>
	<window-frame id="createTrigger">
		<title-bar>Create Trigger<close /></title-bar>
		<content-frame>
			<grid-box>
				<text>Trigger</text
				><file-var id="createTrigger-triggerId" type="file" filter="trigger" />
				<text>Caster</text><custom-box id="createTrigger-caster" type="actor" />
				<text>Origin</text><custom-box id="createTrigger-origin" type="position" />
				<text>Angle</text><custom-box id="createTrigger-angle" type="angle" />
				<text>Distance</text
				><number-var
					id="createTrigger-distance"
					min="-512"
					max="512"
					decimals="4"
					unit="tile"
				 />
				<text>Scale</text
				><number-var
					id="createTrigger-scale"
					min="0.1"
					max="10"
					step="0.1"
					decimals="4"
				 />
				<text>Global Speed</text
				><number-var
					id="createTrigger-timeScale"
					min="0.1"
					max="10"
					step="0.1"
					decimals="4"
				 />
			</grid-box>
			<button id="createTrigger-confirm" name="confirm">Confirm</button>
			<button id="createTrigger-cancel" name="cancel">Cancel</button>
		</content-frame>
	</window-frame>
	
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
