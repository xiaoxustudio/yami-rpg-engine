<template>
	<WindowFrame id="setFocus">
		<TitleBar>Set Focus<close /></TitleBar>
		<content-frame>
			<grid-box>
				<text>Operation</text><SelectBox id="setFocus-operation" />
				<text>Element</text><CustomBox id="setFocus-element" type="element" />
				<text>Mode</text><SelectBox id="setFocus-mode" /> <text>Cancelable</text
				><CheckBox id="setFocus-cancelable" class="standard large" />
			</grid-box>
			<button id="setFocus-confirm" name="confirm">Confirm</button>
			<button id="setFocus-cancel" name="cancel">Cancel</button>
		</content-frame>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import CheckBox from '@app/components/common/CheckBox.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
