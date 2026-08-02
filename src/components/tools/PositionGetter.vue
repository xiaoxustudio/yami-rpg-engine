<template>
		<WindowFrame id="positionGetter">
		<TitleBar>Position<div class="close"></div></TitleBar>
		<content-frame>
			<grid-box>
				<text>Type</text><SelectBox id="positionGetter-type" /> <text>X</text
				><NumberVar
					id="positionGetter-common-x"
					min="-512"
					max="512"
					decimals="4"
					unit="tile"
				/>
				<text>Y</text
				><NumberVar
					id="positionGetter-common-y"
					min="-512"
					max="512"
					decimals="4"
					unit="tile"
				/>
				<text>Actor</text><CustomBox id="positionGetter-actor" type="actor" />
				<text>Trigger</text><CustomBox id="positionGetter-trigger" type="trigger" />
				<text>Light</text><CustomBox id="positionGetter-light" type="light" />
				<text>Region</text><CustomBox id="positionGetter-region" type="region" />
				<text>Mode</text><SelectBox id="positionGetter-region-mode" />
				<text>Object</text
				><CustomBox
					id="positionGetter-objectId"
					type="preset-object"
					filter="any"
				/>
			</grid-box>
			<button id="positionGetter-confirm" name="confirm">Confirm</button>
			<button id="positionGetter-cancel" name="cancel">Cancel</button>
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
