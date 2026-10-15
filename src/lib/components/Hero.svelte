<script>
	import Ridge from './Ridge.svelte';

	// Easter egg: type "atacama" and the sky clears. Seeded, so the server and
	// the browser draw the same stars.
	let seed = 20260711;
	const rand = () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296);
	const stars = Array.from({ length: 140 }, (_, i) => ({
		x: rand() * 100,
		y: rand() * 72,
		r: rand() < 0.88 ? 0.6 + rand() * 0.5 : 1.1 + rand() * 0.6,
		twinkle: rand() < 0.25,
		delay: Math.min(i * 6, 600)
	}));
	// the Southern Cross, upper right, as it hangs over the desert in autumn
	const crux = [
		{ x: 84, y: 34, r: 2.1 }, // Acrux
		{ x: 80.6, y: 22, r: 1.9 }, // Mimosa
		{ x: 85.4, y: 8, r: 1.9 }, // Gacrux
		{ x: 89.2, y: 19.5, r: 1.5 }, // Delta Crucis
		{ x: 86.9, y: 25.5, r: 1.1 } // Epsilon Crucis
	];
</script>

<!-- The sky is always dusk, in both themes; the mountain below it is the page. -->
<section class="sky">
	<svg class="stars" aria-hidden="true">
		{#each stars as s}
			<circle cx="{s.x}%" cy="{s.y}%" r={s.r} class:twinkle={s.twinkle} style="transition-delay:{s.delay}ms; animation-delay:-{s.delay * 7}ms" />
		{/each}
		<g class="crux">
			<line x1="{crux[2].x}%" y1="{crux[2].y}%" x2="{crux[0].x}%" y2="{crux[0].y}%" />
			<line x1="{crux[1].x}%" y1="{crux[1].y}%" x2="{crux[3].x}%" y2="{crux[3].y}%" />
			{#each crux as s}
				<circle cx="{s.x}%" cy="{s.y}%" r={s.r} />
			{/each}
			<text x="{crux[3].x + 1.2}%" y="{crux[3].y + 6}%">Crux</text>
		</g>
	</svg>
	<div class="wrap">
		<h1>AI safety that doesn’t depend on the model behaving.</h1>
		<p class="intro">
			I’m Manuel. I build the layer under AI agents that can’t be talked out of its job: kernel
			sandboxes, hard budget caps, escalate-only clinical rails and contracts that verify proofs.
			Mostly in Rust, from Chile.
		</p>
	</div>
	<Ridge />
</section>

<style>
	.sky {
		--ridge: clamp(190px, 26vw, 300px);
		position: relative;
		padding-top: clamp(2.5rem, 8vw, 6rem);
		color: #fff;
		background: linear-gradient(
			to bottom,
			var(--h0) 0,
			var(--h1) calc(100% - var(--ridge) - 40px),
			var(--h2) calc(100% - var(--ridge) * 0.7),
			var(--h3) calc(100% - var(--ridge) * 0.38),
			var(--h4) calc(100% - var(--ridge) * 0.18),
			var(--h5) calc(100% - 26px)
		);
	}
	.wrap {
		position: relative;
	}
	.stars {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
	}
	.stars circle {
		fill: #fff;
		opacity: 0;
		transition: opacity 600ms var(--ease-out);
	}
	.crux line {
		stroke: var(--h5);
		stroke-width: 0.75;
		stroke-dasharray: 2 4;
		opacity: 0;
		transition: opacity 600ms 700ms var(--ease-out);
	}
	.crux text {
		fill: var(--h-text);
		font-family: var(--mono);
		font-size: 11px;
		letter-spacing: 0.08em;
		opacity: 0;
		transition: opacity 600ms 900ms var(--ease-out);
	}
	:global(:root[data-stars]) .stars circle {
		opacity: 0.85;
	}
	:global(:root[data-stars]) .crux line {
		opacity: 0.5;
	}
	:global(:root[data-stars]) .crux text {
		opacity: 0.7;
	}
	@media (prefers-reduced-motion: no-preference) {
		:global(:root[data-stars]) .stars .twinkle {
			animation: twinkle 3.2s ease-in-out infinite alternate;
		}
	}
	@keyframes twinkle {
		to {
			opacity: 0.25;
		}
	}
	h1 {
		max-width: 17ch;
		font-family: var(--display);
		font-size: var(--step-3);
		font-weight: 600;
		font-variation-settings: 'opsz' 144, 'SOFT' 40;
		letter-spacing: -0.03em;
		line-height: 0.98;
	}
	.intro {
		max-width: 50ch;
		margin-top: clamp(1.25rem, 3vw, 2rem);
		padding-bottom: clamp(1rem, 3vw, 2rem);
		font-size: var(--step-1);
		line-height: 1.4;
		color: var(--h-text);
	}
</style>
