<template>
	<WindowFrame id="fileAnimation-sprite">
		<TitleBar>Sprite<div class="close"></div></TitleBar>
		<content-frame>
			<grid-box>
				<text>Name</text><TextBox id="fileAnimation-sprite-name" /> <text>Image</text
				><CustomBox id="fileAnimation-sprite-image" type="file" filter="image" />
				<text>Horiz Frames</text
				><NumberBox id="fileAnimation-sprite-hframes" min="1" max="256" />
				<text>Vert Frames</text
				><NumberBox id="fileAnimation-sprite-vframes" min="1" max="256" />
			</grid-box>
			<button id="fileAnimation-sprite-confirm" name="confirm">Confirm</button>
			<button id="fileAnimation-sprite-cancel" name="cancel">Cancel</button>
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
import NumberBox from '@app/components/common/NumberBox.vue';
import TextBox from '@app/components/common/TextBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
