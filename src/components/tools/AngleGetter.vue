<template>
	<WindowFrame id="angleGetter">
		<TitleBar>Angle<div class="close" /></TitleBar>
		<content-frame>
			<grid-box>
				<text>Type</text><SelectBox id="angleGetter-type" /> <text>Position</text
				><CustomBox id="angleGetter-position-position" type="position" />
				<text>Degrees</text
				><NumberVar
					id="angleGetter-common-degrees"
					min="-36000"
					max="36000"
					decimals="4"
					unit="deg"
				/>
			</grid-box>
			<button id="angleGetter-confirm" name="confirm">Confirm</button>
			<button id="angleGetter-cancel" name="cancel">Cancel</button>
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
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
