<template>
	<WindowFrame id="event" class="opaque">
		<TitleBar id="event-title"
			>Event<div class="maximize"></div>
			<div class="close"></div>
		</TitleBar>
		<div class="content-frame">
			<div class="field-set input pad" id="event-open-fieldset">
				<div class="legend">Event</div>
				<TreeList id="event-open-list" />
			</div>
			<div class="field-set input pad" id="event-commands-fieldset">
				<div class="legend">Content</div>
				<box id="event-commands-gutter-background" />
				<CommandList id="event-commands" />
				<box id="event-commands-gutter-outer">
					<box id="event-commands-gutter-inner" />
				</box>
			</div>
			<SelectBox id="event-type" />
			<button id="event-confirm" name="confirm">Confirm</button>
			<button id="event-cancel" name="cancel">Cancel</button>
			<button id="event-apply" name="apply">Apply</button>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import CommandList from '@app/components/common/CommandList.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import TreeList from '@app/components/common/TreeList.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
