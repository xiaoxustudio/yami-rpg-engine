<template>
<WindowFrame id="registerEvent">
	<TitleBar>Register Event<close /></TitleBar>
	<content-frame>
		<grid-box>
			<text>Target</text><SelectBox id="registerEvent-target" /> <text>Actor</text
			><CustomBox id="registerEvent-actor" type="actor" /> <text>Element</text
			><CustomBox id="registerEvent-element" type="element" />
			<text>Operation</text><SelectBox id="registerEvent-operation" />
			<text>Type</text><SelectBox id="registerEvent-type" /> <text>Priority</text
			><CheckBox id="registerEvent-priority" class="standard large" />
			<text>Namespace</text
			><CheckBox id="registerEvent-namespace" class="standard large" />
			<text>Tag Name</text><StringVar id="registerEvent-tag" />
		</grid-box>
		<button id="registerEvent-confirm" name="confirm">Confirm</button>
		<button id="registerEvent-cancel" name="cancel">Cancel</button>
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
import StringVar from '@app/components/common/StringVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
