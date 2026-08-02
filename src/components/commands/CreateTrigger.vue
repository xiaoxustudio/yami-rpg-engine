<template>
	<WindowFrame id="createTrigger">
		<TitleBar>Create Trigger<div class="close" /></TitleBar>
		<content-frame>
			<grid-box>
				<text>Trigger</text
				><FileVar id="createTrigger-triggerId" type="file" filter="trigger" />
				<text>Caster</text><CustomBox id="createTrigger-caster" type="actor" />
				<text>Origin</text><CustomBox id="createTrigger-origin" type="position" />
				<text>Angle</text><CustomBox id="createTrigger-angle" type="angle" />
				<text>Distance</text
				><NumberVar
					id="createTrigger-distance"
					min="-512"
					max="512"
					decimals="4"
					unit="tile"
				 />
				<text>Scale</text
				><NumberVar
					id="createTrigger-scale"
					min="0.1"
					max="10"
					step="0.1"
					decimals="4"
				 />
				<text>Global Speed</text
				><NumberVar
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
	</WindowFrame>
	
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import CustomBox from '@app/components/common/CustomBox.vue';
import FileVar from '@app/components/common/FileVar.vue';
import NumberVar from '@app/components/common/NumberVar.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
