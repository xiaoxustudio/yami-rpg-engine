<template>
	<!-- 变量访问器窗口 -->
	<WindowFrame id="variableGetter">
		<TitleBar>Variable<close /></TitleBar>
		<content-frame>
			<grid-box>
				<text>Type</text><select-box id="variableGetter-type" /> <text>Actor</text
				><custom-box id="variableGetter-actor" type="actor" /> <text>Skill</text
				><custom-box id="variableGetter-skill" type="skill" /> <text>State</text
				><custom-box id="variableGetter-state" type="state" /> <text>Equipment</text
				><custom-box id="variableGetter-equipment" type="equipment" />
				<text>Item</text><custom-box id="variableGetter-item" type="item" />
				<text>Element</text><custom-box id="variableGetter-element" type="element" />
				<text>Key</text><text-box id="variableGetter-common-key" /> <text>Key</text
				><select-var id="variableGetter-preset-key" /> <text>Key</text
				><custom-box id="variableGetter-global-key" type="global-variable" />
			</grid-box>
			<button id="variableGetter-confirm" name="confirm">Confirm</button>
			<button id="variableGetter-cancel" name="cancel">Cancel</button>
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
