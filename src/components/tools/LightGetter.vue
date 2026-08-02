<template>
	<WindowFrame id="lightGetter">
		<TitleBar>Light<div class="close"></div></TitleBar>
		<content-frame>
			<grid-box>
				<text>Type</text><SelectBox id="lightGetter-type" /> <text>Light</text
				><CustomBox id="lightGetter-presetId" type="preset-object" filter="light" />
				<text>Variable</text
				><CustomBox id="lightGetter-variable" type="variable" filter="object" />
			</grid-box>
			<button id="lightGetter-confirm" name="confirm">Confirm</button>
			<button id="lightGetter-cancel" name="cancel">Cancel</button>
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
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
