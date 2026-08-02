<template>
	<WindowFrame id="equipmentGetter">
		<TitleBar>Actor<div class="close"></div></TitleBar>
		<content-frame>
			<grid-box>
				<text>Type</text><SelectBox id="equipmentGetter-type" /> <text>Actor</text
				><CustomBox id="equipmentGetter-actor" type="actor" /> <text>Slot</text
				><SelectVar id="equipmentGetter-slot" /> <text>Equipment</text
				><CustomBox
					id="equipmentGetter-equipmentId"
					type="file"
					filter="equipment"
				/>
				<text>Variable</text
				><CustomBox id="equipmentGetter-variable" type="variable" filter="object" />
			</grid-box>
			<button id="equipmentGetter-confirm" name="confirm">Confirm</button>
			<button id="equipmentGetter-cancel" name="cancel">Cancel</button>
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
import SelectVar from '@app/components/common/SelectVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
