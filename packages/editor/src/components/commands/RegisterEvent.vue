<template>
<WindowFrame id="registerEvent">
	<TitleBar>Register Event<div class="close" /></TitleBar>
	<div class="content-frame">
		<div class="grid-box">
			<div class="text">Target</div><SelectBox id="registerEvent-target" /> <div class="text">Actor</div
			><CustomBox id="registerEvent-actor" type="actor" /> <div class="text">Element</div
			><CustomBox id="registerEvent-element" type="element" />
			<div class="text">Operation</div><SelectBox id="registerEvent-operation" />
			<div class="text">Type</div><SelectBox id="registerEvent-type" /> <div class="text">Priority</div
			><CheckBox id="registerEvent-priority" class="standard large" />
			<div class="text">Namespace</div
			><CheckBox id="registerEvent-namespace" class="standard large" />
			<div class="text">Tag Name</div><StringVar id="registerEvent-tag" />
		</div>
		<button id="registerEvent-confirm" name="confirm">Confirm</button>
		<button id="registerEvent-cancel" name="cancel">Cancel</button>
	</div>
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
