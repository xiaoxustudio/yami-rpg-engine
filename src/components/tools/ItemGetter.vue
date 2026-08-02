<template>
	<WindowFrame id="itemGetter">
		<TitleBar>Actor<div class="close"></div></TitleBar>
		<content-frame>
			<grid-box>
				<text>Type</text><SelectBox id="itemGetter-type" /> <text>Actor</text
				><CustomBox id="itemGetter-actor" type="actor" /> <text>Shortcut Key</text
				><SelectVar id="itemGetter-key" /> <text>Item</text
				><CustomBox id="itemGetter-itemId" type="file" filter="item" />
				<text>Variable</text
				><CustomBox id="itemGetter-variable" type="variable" filter="object" />
			</grid-box>
			<button id="itemGetter-confirm" name="confirm">Confirm</button>
			<button id="itemGetter-cancel" name="cancel">Cancel</button>
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
import SelectVar from '@app/components/common/SelectVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
