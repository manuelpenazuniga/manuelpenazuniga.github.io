import { sveltekit } from '@sveltejs/kit/vite';
import adapter from '@sveltejs/adapter-static';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		sveltekit({
			// 404.html is what GitHub Pages serves for unknown URLs
			adapter: adapter({ fallback: '404.html' })
		})
	]
});
