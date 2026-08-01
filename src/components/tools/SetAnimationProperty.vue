<template>
		<window-frame id="setAnimation-property">
		<title-bar>Set Animation<close></close></title-bar>
		<content-frame>
			<grid-box>
				<text>Property</text><select-box id="setAnimation-property-key" />
				<text>Animation</text
				><custom-box
					id="setAnimation-property-animation"
					type="file"
					filter="animation"
				/>
				<text>Actor</text
				><custom-box id="setAnimation-property-actor" type="actor" />
				<text>Motion</text
				><custom-box id="setAnimation-property-motion" type="enum-string" />
				<text>Angle</text
				><number-var id="setAnimation-property-angle" min="0" max="360" unit="deg" />
				<text>Frame</text
				><number-var id="setAnimation-property-frame" min="0" max="10000" />
			</grid-box>
			<button id="setAnimation-property-confirm" name="confirm">Confirm</button>
			<button id="setAnimation-property-cancel" name="cancel">Cancel</button>
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
