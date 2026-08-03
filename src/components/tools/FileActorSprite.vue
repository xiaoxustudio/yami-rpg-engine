<template>
	<WindowFrame id="fileActor-sprite">
		<TitleBar>Sprite<div class="close"></div></TitleBar>
		<div class="content-frame">
			<div class="grid-box">
				<div class="text">Name</div><SelectBox id="fileActor-sprite-id" /> <div class="text">Image</div
				><CustomBox id="fileActor-sprite-image" type="file" filter="image" />
			</div>
			<button id="fileActor-sprite-confirm" name="confirm">Confirm</button>
			<button id="fileActor-sprite-cancel" name="cancel">Cancel</button>
		</div>
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
