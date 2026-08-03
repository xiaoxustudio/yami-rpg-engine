<template>
		<WindowFrame id="setAnimation-property">
		<TitleBar>Set Animation<div class="close"></div></TitleBar>
		<div class="content-frame">
			<div class="grid-box">
				<text>Property</text><SelectBox id="setAnimation-property-key" />
				<text>Animation</text
				><CustomBox
					id="setAnimation-property-animation"
					type="file"
					filter="animation"
				/>
				<text>Actor</text
				><CustomBox id="setAnimation-property-actor" type="actor" />
				<text>Motion</text
				><CustomBox id="setAnimation-property-motion" type="enum-string" />
				<text>Angle</text
				><NumberVar id="setAnimation-property-angle" min="0" max="360" unit="deg" />
				<text>Frame</text
				><NumberVar id="setAnimation-property-frame" min="0" max="10000" />
			</div>
			<button id="setAnimation-property-confirm" name="confirm">Confirm</button>
			<button id="setAnimation-property-cancel" name="cancel">Cancel</button>
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
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
