<template>
	<WindowFrame id="fileAnimation-sprite">
		<TitleBar>Sprite<div class="close"></div></TitleBar>
		<div class="content-frame">
			<div class="grid-box">
				<div class="text">Name</div><TextBox id="fileAnimation-sprite-name" /> <div class="text">Image</div
				><CustomBox id="fileAnimation-sprite-image" type="file" filter="image" />
				<div class="text">Horiz Frames</div
				><NumberBox id="fileAnimation-sprite-hframes" min="1" max="256" />
				<div class="text">Vert Frames</div
				><NumberBox id="fileAnimation-sprite-vframes" min="1" max="256" />
			</div>
			<button id="fileAnimation-sprite-confirm" name="confirm">Confirm</button>
			<button id="fileAnimation-sprite-cancel" name="cancel">Cancel</button>
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
import NumberBox from '@app/components/common/NumberBox.vue';
import TextBox from '@app/components/common/TextBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
