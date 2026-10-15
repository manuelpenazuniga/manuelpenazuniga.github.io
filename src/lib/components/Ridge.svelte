<script>
	// A year of contributions drawn as a skyline: one summit per week.
	import { onMount } from 'svelte';
	import { scaleLinear } from 'd3-scale';
	import { area, line, curveBasis } from 'd3-shape';
	import data from '#lib/data/contributions.json';
	import { monthName, num } from '#lib/series.js';

	const weeks = [];
	for (let i = 0; i < data.days.length; i += 7) {
		const chunk = data.days.slice(i, i + 7);
		const [y, m, d] = chunk[0][0].split('-').map(Number);
		weeks.push({ y, m, d, n: chunk.reduce((a, [, c]) => a + c, 0) });
	}
	const peak = weeks.reduce((a, b) => (b.n > a.n ? b : a));
	const peakAt = weeks.indexOf(peak);
	const max = peak.n;
	const far = weeks.map((_, i) => Math.max(...weeks.slice(Math.max(0, i - 4), i + 5).map((wk) => wk.n)));
	const label = (wk) => `${monthName(wk.m)} ${wk.d}`;

	let w = $state(1280);
	let hover = $state(null);
	let ridgeEl, alpacaEl;
	let walking = false;

	const h = $derived(Math.max(190, Math.min(300, w * 0.26)));
	const top = 30;
	const base = $derived(h - 26);
	const x = $derived(scaleLinear([0, weeks.length - 1], [0, w]));
	const y = $derived(scaleLinear([0, max], [base, top]));
	const ridge = $derived(line((d, i) => x(i), (d) => y(d.n))(weeks));
	const fill = $derived(area((d, i) => x(i), h, (d) => y(d.n))(weeks));
	const range = $derived(area((d, i) => x(i), h, (d) => y(d)).curve(curveBasis)(far));
	const ticks = $derived(
		weeks
			.map((wk, i) => ({ wk, i }))
			.filter(({ wk, i }) => i > 0 && wk.m !== weeks[i - 1].m)
			.filter((_, k) => w >= 520 || k % 2 === 0)
	);
	const peakAnchor = $derived(x(peakAt) > w * 0.7 ? 'end' : x(peakAt) < w * 0.3 ? 'start' : 'middle');

	function move(e) {
		const r = e.currentTarget.getBoundingClientRect();
		const i = Math.round(x.invert(e.clientX - r.left));
		hover = Math.max(0, Math.min(weeks.length - 1, i));
	}

	// Easter egg: the Konami code sends an alpaca along the ridge (see Eggs.svelte).
	async function walk() {
		if (walking || !ridgeEl) return;
		walking = true;
		const len = ridgeEl.getTotalLength();
		const place = (p) => {
			const pt = ridgeEl.getPointAtLength(p * len);
			const hop = Math.abs(Math.sin(p * 70)) * 3;
			alpacaEl.setAttribute('transform', `translate(${pt.x - 18},${pt.y - 27 - hop})`);
		};
		const done = () => {
			alpacaEl.style.visibility = 'hidden';
			walking = false;
		};
		alpacaEl.style.visibility = 'visible';
		if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
			place(peakAt / (weeks.length - 1));
			setTimeout(done, 4000);
			return;
		}
		const { gsap } = await import('gsap');
		const s = { p: 0 };
		gsap.to(s, { p: 1, duration: 11, ease: 'none', onUpdate: () => place(s.p), onComplete: done });
	}

	onMount(() => {
		addEventListener('alpaca:walk', walk);
		return () => removeEventListener('alpaca:walk', walk);
	});

	const ALPACA = [
		'.........##.',
		'........###.',
		'........##..',
		'........##..',
		'.########...',
		'##########..',
		'.########...',
		'.#.#..#.#...',
		'.#.#..#.#...'
	];
</script>

<figure class="ridge">
	<div class="plot" bind:clientWidth={w}>
		<svg
			width={w}
			height={h}
			role="img"
			aria-label="Contributions per week over the last year. The highest week had {num(max)} contributions."
			onpointermove={move}
			onpointerleave={() => (hover = null)}
		>
			<path class="far" d={range} />
			<path class="near" d={fill} />
			<path class="line" d={ridge} bind:this={ridgeEl} pathLength="1" />
			{#each ticks as t}
				<text class="tick" x={x(t.i)} y={h - 8}>{monthName(t.wk.m)}</text>
			{/each}
			<text class="note" x={x(peakAt)} y={y(max) - 12} text-anchor={peakAnchor}>
				{num(max)} contributions, week of {label(peak)}
			</text>
			{#if hover !== null}
				<line class="cross" x1={x(hover)} x2={x(hover)} y1={top - 6} y2={base} />
				<circle class="dot" cx={x(hover)} cy={y(weeks[hover].n)} r="5" />
			{/if}
			<g bind:this={alpacaEl} style="visibility:hidden" aria-hidden="true">
				{#each ALPACA as row, r}
					{#each row as c, col}
						{#if c === '#'}<rect class="px" x={col * 3} y={r * 3} width="3" height="3" />{/if}
					{/each}
				{/each}
			</g>
		</svg>
		{#if hover !== null}
			<div class="tip" style="left:{Math.max(80, Math.min(w - 80, x(hover)))}px; top:{y(weeks[hover].n)}px">
				<div class="tip-head">Week of {label(weeks[hover])}, {weeks[hover].y}</div>
				<strong>{num(weeks[hover].n)}</strong> contributions
			</div>
		{/if}
	</div>
	<figcaption>
		{num(data.total)} contributions on GitHub in the last year, one summit per week.
	</figcaption>
</figure>

<style>
	.ridge {
		margin: 0;
	}
	.plot {
		margin-top: 0;
	}
	svg {
		touch-action: pan-y;
	}
	/* the near range is the page itself rising into the sky */
	.near {
		fill: var(--paper);
		animation: rise 1.4s var(--ease-out) both;
	}
	.far {
		fill: var(--h-far);
		opacity: 0.55;
		animation: rise 1.4s 0.15s var(--ease-out) both;
	}
	.line {
		fill: none;
		stroke: #fff;
		stroke-opacity: 0.85;
		stroke-width: 1.5;
		stroke-linejoin: round;
		stroke-dasharray: 1;
		animation: draw 2.4s 0.5s var(--ease-in-out) both;
	}
	figcaption {
		padding-block: 0.25rem 1.25rem;
		/* full-bleed strip, text aligned with the page column */
		padding-inline: max(var(--gutter), calc((100% - 76rem) / 2 + var(--gutter)));
		background: var(--paper);
		color: var(--muted);
		font-size: var(--step--1);
	}
	.plot .note {
		fill: #fff;
	}
	.plot .tick {
		fill: var(--muted);
	}
	.cross {
		stroke: #fff;
		stroke-opacity: 0.6;
	}
	.dot {
		fill: #fff;
		stroke: var(--cyan);
		stroke-width: 2;
	}
	.px {
		fill: #0b1020;
	}
	@keyframes draw {
		from {
			stroke-dashoffset: 1;
		}
		to {
			stroke-dashoffset: 0;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.near,
		.far {
			animation-name: fade;
			animation-duration: 0.6s;
		}
		.line {
			animation: none;
		}
	}
	@keyframes fade {
		from {
			opacity: 0;
		}
	}
	@keyframes rise {
		from {
			transform: translateY(40%);
			opacity: 0;
		}
	}
</style>
