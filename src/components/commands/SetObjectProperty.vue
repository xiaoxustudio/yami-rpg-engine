<template>
	<WindowFrame id="setObjectProperty">
		<TitleBar>setObjectProperty<div class="close" /></TitleBar>
		<div class="content-frame">
			<div class="grid-box">
				<div class="text">Variable</div
				><CustomBox
					id="setObjectProperty-variable"
					type="variable"
					filter="object"
				/>
				<div class="text">setObjectProperty</div><ParamList id="setObjectProperty-list" />
				<div class="text">valueVariable</div
				><CustomBox
					id="setObjectProperty-value-variable"
					type="variable"
					filter="all"
				/>
			</div>
			<button id="setObjectProperty-confirm" name="confirm">Confirm</button>
			<button id="setObjectProperty-cancel" name="cancel">Cancel</button>
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
import ParamList from '@app/components/common/ParamList.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
