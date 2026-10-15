<script>
	import '../app.css';
	import { site } from '#lib/content.js';
	import Eggs from '#lib/components/Eggs.svelte';
	import Terminal from '#lib/components/Terminal.svelte';

	let { children } = $props();

	function toggleTheme() {
		const root = document.documentElement;
		const dark =
			root.dataset.theme === 'dark' ||
			(!root.dataset.theme && matchMedia('(prefers-color-scheme: dark)').matches);
		const flip = () => {
			root.dataset.theme = dark ? 'light' : 'dark';
			try {
				localStorage.setItem('theme', root.dataset.theme);
			} catch {}
		};
		// crossfade the whole page where the browser can; otherwise just flip
		if (document.startViewTransition && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
			document.startViewTransition(flip);
		} else {
			flip();
		}
	}
</script>

<a class="skip" href="#main">Skip to content</a>

<header class="top">
	<div class="wrap bar">
		<a class="me" href="/">{site.name}</a>
		<nav aria-label="Sections">
			<a href="/#approach">Approach</a>
			<a href="/#work">Work</a>
			<a href="/#lab">Evaluation</a>
			<a href="/#sides">Side projects</a>
			<a href="/#data">Field data</a>
			<a href="/#writing">Writing</a>
			<a href="/#path">Path</a>
		</nav>
		<button class="theme" type="button" onclick={toggleTheme} aria-label="Switch between light and dark">
			<svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
				<circle cx="10" cy="10" r="7.5" fill="none" stroke="currentColor" stroke-width="1.5" />
				<path d="M10 2.5a7.5 7.5 0 0 1 0 15z" fill="currentColor" />
			</svg>
		</button>
	</div>
</header>

<main id="main">
	{@render children()}
</main>

<Eggs />
<Terminal />

<style>
	.skip {
		position: absolute;
		left: -999px;
		top: 0.5rem;
		z-index: 20;
		padding: 0.5rem 0.75rem;
		background: var(--ink);
		color: var(--paper);
		border-radius: 6px;
	}
	.skip:focus {
		left: 0.5rem;
	}
	.top {
		position: sticky;
		top: 0;
		z-index: 10;
		background: color-mix(in oklab, var(--paper) 86%, transparent);
		backdrop-filter: blur(10px);
		border-bottom: 1px solid var(--line);
	}
	.bar {
		display: flex;
		align-items: center;
		gap: 1.25rem;
		min-height: 3.5rem;
	}
	.me {
		font-weight: 700;
		text-decoration: none;
		margin-right: auto;
		white-space: nowrap;
	}
	nav {
		display: flex;
		gap: clamp(0.75rem, 2.5vw, 1.75rem);
		font-size: var(--step--1);
	}
	nav a {
		text-decoration: none;
		color: var(--ink-2);
		padding-block: 0.5rem;
		white-space: nowrap;
	}
	nav a:hover {
		color: var(--ink);
	}
	.theme {
		display: grid;
		place-items: center;
		width: 2.25rem;
		height: 2.25rem;
		background: none;
		border: 1px solid var(--line);
		border-radius: 50%;
		cursor: pointer;
	}
	.theme:hover {
		border-color: var(--line-strong);
	}
	/* on a phone the section links drop to their own row and scroll sideways */
	@media (max-width: 44rem) {
		.bar {
			flex-wrap: wrap;
			gap: 0 1rem;
			padding-top: 0.4rem;
		}
		nav {
			order: 3;
			width: 100%;
			overflow-x: auto;
			scrollbar-width: none;
			gap: 1.25rem;
		}
	}
</style>
