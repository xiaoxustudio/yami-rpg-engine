<template>
		<WindowFrame id="positionGetter">
		<TitleBar>Position<div class="close"></div></TitleBar>
		<div class="content-frame">
			<div class="grid-box">
				<div class="text">Type</div><SelectBox id="positionGetter-type" /> <div class="text">X</div
				><NumberVar
					id="positionGetter-common-x"
					min="-512"
					max="512"
					decimals="4"
					unit="tile"
				/>
				<div class="text">Y</div
				><NumberVar
					id="positionGetter-common-y"
					min="-512"
					max="512"
					decimals="4"
					unit="tile"
				/>
				<div class="text">Actor</div><CustomBox id="positionGetter-actor" type="actor" />
				<div class="text">Trigger</div><CustomBox id="positionGetter-trigger" type="trigger" />
				<div class="text">Light</div><CustomBox id="positionGetter-light" type="light" />
				<div class="text">Region</div><CustomBox id="positionGetter-region" type="region" />
				<div class="text">Mode</div><SelectBox id="positionGetter-region-mode" />
				<div class="text">Object</div
				><CustomBox
					id="positionGetter-objectId"
					type="preset-object"
					filter="any"
				/>
			</div>
			<button id="positionGetter-confirm" name="confirm">Confirm</button>
			<button id="positionGetter-cancel" name="cancel">Cancel</button>
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
