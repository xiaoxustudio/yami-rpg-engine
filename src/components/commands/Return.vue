<template>
<WindowFrame id="return">
	<TitleBar>Return<close /></TitleBar>
	<content-frame>
		<grid-box>
			<text>Type</text><select-box id="return-type" /> <text>Boolean</text
			><select-box id="return-boolean" /> <text>Number</text
			><number-var
				id="return-number"
				min="-1000000000"
				max="1000000000"
				decimals="10"
			 />
			<text>String</text><string-var id="return-string" /> <text>Object</text
			><custom-box id="return-object" type="variable" filter="object" />
			<text>Actor</text><custom-box id="return-actor" type="actor" />
			<text>Skill</text><custom-box id="return-skill" type="skill" />
			<text>State</text><custom-box id="return-state" type="state" />
			<text>Equipment</text><custom-box id="return-equipment" type="equipment" />
			<text>Item</text><custom-box id="return-item" type="item" />
			<text>Trigger</text><custom-box id="return-trigger" type="trigger" />
			<text>Light</text><custom-box id="return-light" type="light" />
			<text>Element</text><custom-box id="return-element" type="element" />
		</grid-box>
		<button id="return-confirm" name="confirm">Confirm</button>
		<button id="return-cancel" name="cancel">Cancel</button>
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
