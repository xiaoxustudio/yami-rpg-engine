<template>
	<Teleport to="body">
		<div class="layout-palette-holder" :style="{ display: 'none' }">
			<slot />
		</div>
	</Teleport>
</template>

<script setup lang="ts"></script>
