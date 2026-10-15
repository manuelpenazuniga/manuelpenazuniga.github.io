<script>
	import { page } from '$app/state';
</script>

<svelte:head><title>Unconformity · Manuel Peña</title></svelte:head>

<section class="wrap gap">
	<svg viewBox="0 0 600 150" role="img" aria-label="Rock layers with one layer missing">
		<path d="M0 30 Q150 14 300 30 T600 26" />
		<path d="M0 60 Q150 44 300 58 T600 54" />
		<path class="lost" d="M0 82 Q80 70 150 84 T300 78 T450 88 T600 78" />
		<path d="M0 108 Q150 96 300 110 T600 104" />
		<path d="M0 136 Q150 124 300 138 T600 132" />
	</svg>
	<h1>{page.status === 404 ? 'This layer is missing from the record' : 'Something broke'}</h1>
	<p>
		Geologists call a gap like this an unconformity: the rock that should be here was never laid
		down, or eroded away. There is nothing at <code>{page.url.pathname}</code>.
	</p>
	<p><a href="/">Go back to the surface</a></p>
</section>

<style>
	.gap {
		padding-block: clamp(3rem, 12vw, 8rem);
		display: grid;
		gap: 1.25rem;
		max-width: 46rem;
	}
	svg {
		width: 100%;
		fill: none;
		stroke: var(--line-strong);
		stroke-width: 1.5;
	}
	.lost {
		stroke: var(--cyan);
		stroke-dasharray: 3 7;
	}
	h1 {
		font-size: var(--step-2);
	}
	p {
		color: var(--ink-2);
	}
	code {
		font-family: var(--mono);
		font-size: 0.9em;
	}
</style>
