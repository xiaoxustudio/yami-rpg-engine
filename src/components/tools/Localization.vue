<template>
	<WindowFrame id="localization" mode="center">
		<TitleBar>Localization<close></close></TitleBar>
		<content-frame>
			<field-set id="localization-list-fieldset" class="input pad">
				<legend>List</legend>
				<TreeList id="localization-list" padded />
			</field-set>
			<box id="localization-inspector" />
			<TextBox id="localization-searcher" name="search" />
			<button id="localization-from-excel" name="from-excel">from-excel</button>
			<button id="localization-to-excel" name="to-excel">to-excel</button>
			<button id="localization-confirm" name="confirm">Confirm</button>
			<button id="localization-cancel" name="cancel">Cancel</button>
			<button id="localization-apply" name="apply">Apply</button>
		</content-frame>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import TextBox from '@app/components/common/TextBox.vue';
import TreeList from '@app/components/common/TreeList.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
