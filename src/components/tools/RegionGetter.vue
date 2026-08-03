<template>
		<WindowFrame id="regionGetter">
		<TitleBar>Region<div class="close"></div></TitleBar>
		<div class="content-frame">
			<div class="grid-box">
				<div class="text">Type</div><SelectBox id="regionGetter-type" /> <div class="text">Region</div
				><CustomBox
					id="regionGetter-presetId"
					type="preset-object"
					filter="region"
				/>
			</div>
			<button id="regionGetter-confirm" name="confirm">Confirm</button>
			<button id="regionGetter-cancel" name="cancel">Cancel</button>
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
