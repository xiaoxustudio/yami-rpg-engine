<template>
		<WindowFrame id="positionGetter">
		<TitleBar>Position<close></close></TitleBar>
		<content-frame>
			<grid-box>
				<text>Type</text><select-box id="positionGetter-type" /> <text>X</text
				><number-var
					id="positionGetter-common-x"
					min="-512"
					max="512"
					decimals="4"
					unit="tile"
				/>
				<text>Y</text
				><number-var
					id="positionGetter-common-y"
					min="-512"
					max="512"
					decimals="4"
					unit="tile"
				/>
				<text>Actor</text><custom-box id="positionGetter-actor" type="actor" />
				<text>Trigger</text><custom-box id="positionGetter-trigger" type="trigger" />
				<text>Light</text><custom-box id="positionGetter-light" type="light" />
				<text>Region</text><custom-box id="positionGetter-region" type="region" />
				<text>Mode</text><select-box id="positionGetter-region-mode" />
				<text>Object</text
				><custom-box
					id="positionGetter-objectId"
					type="preset-object"
					filter="any"
				/>
			</grid-box>
			<button id="positionGetter-confirm" name="confirm">Confirm</button>
			<button id="positionGetter-cancel" name="cancel">Cancel</button>
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
