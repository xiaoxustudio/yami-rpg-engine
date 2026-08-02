<template>
	<WindowFrame id="setObject">
		<TitleBar>Set Object<close /></TitleBar>
		<content-frame>
			<grid-box>
				<text>Variable</text
				><custom-box id="setObject-variable" type="variable" filter="object" />
				<text>Type</text><select-box id="setObject-operand-type" /> <text>Actor</text
				><custom-box id="setObject-operand-actor" type="actor" /> <text>Skill</text
				><custom-box id="setObject-operand-skill" type="skill" /> <text>State</text
				><custom-box id="setObject-operand-state" type="state" />
				<text>Equipment</text
				><custom-box id="setObject-operand-equipment" type="equipment" />
				<text>Item</text><custom-box id="setObject-operand-item" type="item" />
				<text>Trigger</text
				><custom-box id="setObject-operand-trigger" type="trigger" />
				<text>Light</text><custom-box id="setObject-operand-light" type="light" />
				<text>Object</text><custom-box id="setObject-operand-object" type="object" />
				<text>Element</text
				><custom-box id="setObject-operand-element" type="element" />
				<text>Variable</text
				><custom-box
					id="setObject-operand-variable"
					type="variable"
					filter="object"
				/>
				<text>Index</text
				><number-var id="setObject-operand-list-index" min="0" max="1000000000" />
			</grid-box>
			<button id="setObject-confirm" name="confirm">Confirm</button>
			<button id="setObject-cancel" name="cancel">Cancel</button>
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
