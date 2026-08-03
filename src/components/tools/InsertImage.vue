<template>
	<WindowFrame id="insertImage">
		<TitleBar>Insert Image<div class="close"></div></TitleBar>
		<div class="content-frame">
			<div class="grid-box">
				<text>Mode</text><SelectBox id="insertImage-mode" /> <text>Image</text
				><CustomBox id="insertImage-image" type="file" filter="image" />
				<text>Clip</text
				><CustomBox id="insertImage-clip" type="clip" image="insertImage-image" />
				<text>Width</text><NumberBox id="insertImage-width" min="0" max="10000" />
				<text>Height</text><NumberBox id="insertImage-height" min="0" max="10000" />
			</div>
			<button id="insertImage-confirm" name="confirm">Confirm</button>
			<button id="insertImage-cancel" name="cancel">Cancel</button>
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
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
