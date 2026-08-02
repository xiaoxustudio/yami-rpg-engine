<template>
	<WindowFrame id="moveLight">
		<TitleBar>Move Light<div class="close" /></TitleBar>
		<content-frame>
			<grid-box>
				<text>Light</text><CustomBox id="moveLight-light" type="light" />
				<text>Properties</text><ParamList id="moveLight-properties" />
				<text>Easing</text><SelectBox id="moveLight-easingId" name="easing" />
				<text>Duration</text
				><NumberBox
					id="moveLight-duration"
					name="duration"
					min="0"
					max="3600000"
					unit="ms"
				 />
				<text>Wait</text><SelectBox id="moveLight-wait" name="wait" />
			</grid-box>
			<button id="moveLight-confirm" name="confirm">Confirm</button>
			<button id="moveLight-cancel" name="cancel">Cancel</button>
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
import ParamList from '@app/components/common/ParamList.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
