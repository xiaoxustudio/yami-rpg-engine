<template>
	<WindowFrame id="equipmentGetter">
		<template #title><TitleBar>Actor<div class="close"></div></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Type</div><SelectBox id="equipmentGetter-type" /> <div class="text">Actor</div
				><CustomBox id="equipmentGetter-actor" type="actor" /> <div class="text">Slot</div
				><SelectVar id="equipmentGetter-slot" /> <div class="text">Equipment</div
				><CustomBox
					id="equipmentGetter-equipmentId"
					type="file"
					filter="equipment"
				/>
				<div class="text">Variable</div
				><CustomBox id="equipmentGetter-variable" type="variable" filter="object" />
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
import SelectVar from '@app/components/common/SelectVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
