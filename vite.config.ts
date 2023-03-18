import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { resolve } from "path";

export default defineConfig({
	resolve: {
	  alias: {
		$src: resolve("./src"),
		$models: resolve("./src/models"),
		$components: resolve("./src/components"),
	  },
	},
	plugins: [sveltekit()]
});
