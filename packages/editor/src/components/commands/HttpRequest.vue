<template>
<WindowFrame id="httpRequest" @confirm="onConfirm">
	<template #title><TitleBar>httpRequest<div class="close" /></TitleBar></template>
	
		<div class="grid-box">
			<div class="text">URL</div><StringVar id="httpRequest-url" /> <div class="text">Method</div
			><SelectBox id="httpRequest-method" /> <div class="text">Header</div
			><ParamList id="httpRequest-header" /> <div class="text">Data</div
			><ParamList id="httpRequest-data" /> <div class="text">TimeOut</div
			><NumberBox id="httpRequest-timeout" /> <div class="text">ResponseType</div
			><SelectBox id="httpRequest-responseType" /> <div class="text">WithCredentials</div
			><CheckBox class="standard" id="httpRequest-withCredentials" />
			<div class="text">AuthUser</div><StringVar id="httpRequest-authUser" />
			<div class="text">AuthPass</div><StringVar id="httpRequest-authPass" />
			<div class="text">CallBack</div
			><CustomBox id="httpRequest-callback" type="file" filter="event" />
		</div>
	
</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { Command } from '@/command/command-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import CheckBox from '@app/components/common/CheckBox.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import StringVar from '@app/components/common/StringVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import ParamList from '@app/components/common/ParamList.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

const onConfirm = () => {
	Command?.cases?.httpRequest?.save?.();
};

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
