<script>
	// Two projects where I am the only developer. The repositories are private,
	// so the page shows counts only (see data/sides.json).
	import { scaleLinear } from 'd3-scale';
	import data from '#lib/data/activity.json';
	import { sides } from '#lib/content.js';
	import { monthName, num } from '#lib/series.js';

	const index = (ym) => {
		const [y, m] = ym.split('-').map(Number);
		return y * 12 + m - 1;
	};
	const all = Object.values(data.owners).flatMap((o) => Object.keys(o.months));
	const first = Math.min(...all.map(index));
	const last = Math.max(...all.map(index));
	// both charts share one time axis and one scale, so their heights compare
	const months = Array.from({ length: last - first + 1 }, (_, i) => {
		const n = first + i;
		return { y: Math.floor(n / 12), m: (n % 12) + 1, key: `${Math.floor(n / 12)}-${String((n % 12) + 1).padStart(2, '0')}` };
	});
	const peak = Math.max(...Object.values(data.owners).flatMap((o) => Object.values(o.months)));
	const since = (o) => {
		const [y, m] = Object.keys(o.months)[0].split('-').map(Number);
		return `${monthName(m)} ${y}`;
	};

	let widths = $state([420, 420]);
	let hover = $state(null);
	const h = 120;
	const base = h - 20;
	const y = scaleLinear([0, peak], [base, 14]);

	function cap(x, yy, ww, hh) {
		const r = Math.min(1, ww / 2, hh);
		return `M${x},${yy + hh}V${yy + r}Q${x},${yy} ${x + r},${yy}H${x + ww - r}Q${x + ww},${yy} ${x + ww},${yy + r}V${yy + hh}Z`;
	}
</script>

<section id="sides" class="wrap band">
	<h2>Side projects</h2>
	<div class="band-body">
		<div class="pair">
			{#each sides as side, s}
				{@const o = data.owners[side.owner]}
				<article>
					<h3><a href={side.href}>{side.name}</a></h3>
					<p class="role">{side.role}</p>
					<p class="what">{side.what}</p>

					<dl>
						<div>
							<dt>commits by me</dt>
							<dd>{num(o.commits)}</dd>
						</div>
						<div>
							<dt>{o.repos === 1 ? 'private repo' : 'private repos'}</dt>
							<dd>{o.repos}</dd>
						</div>
						<div>
							<dt>building since</dt>
							<dd>{since(o)}</dd>
						</div>
					</dl>

					<div class="plot" bind:clientWidth={widths[s]}>
						<svg width={widths[s]} height={h} role="img" aria-label="Commits per month to {side.name}" onpointerleave={() => (hover = null)}>
							<line class="axis" x1="0" x2={widths[s]} y1={base} y2={base} />
							{#each months as mo, i}
								{@const n = o.months[mo.key] ?? 0}
								{@const band = widths[s] / months.length}
								{@const bw = Math.max(3, Math.min(24, band - 3))}
								{#if n}
									<path class:dim={hover && hover.s === s && hover.i !== i} d={cap(i * band + (band - bw) / 2, y(n), bw, base - y(n))} />
								{/if}
								<rect class="hit" x={i * band} y="0" width={band} height={base} onpointerenter={() => (hover = { s, i, n, mo, x: (i + 0.5) * band })} />
								{#if i === 0 || mo.m === 1}
									<text x={i * band + 1} y={h - 4}>{monthName(mo.m)} {mo.y}</text>
								{/if}
							{/each}
						</svg>
						{#if hover && hover.s === s}
							<div class="tip" style="left:{Math.max(70, Math.min(widths[s] - 70, hover.x))}px; top:{y(hover.n)}px">
								<div class="tip-head">{monthName(hover.mo.m)} {hover.mo.y}</div>
								<strong>{num(hover.n)}</strong>
								{hover.n === 1 ? 'commit' : 'commits'}
							</div>
						{/if}
					</div>
				</article>
			{/each}
		</div>
		<p class="fine">Commits per month, same scale on both charts. Counted on {data.generated}.</p>
	</div>
</section>

<style>
	/* each card sizes itself from its own width, not the window's */
	.pair {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 19rem), 1fr));
		gap: 2.5rem 3rem;
	}
	article {
		container-type: inline-size;
		min-width: 0;
		display: flex;
		flex-direction: column;
		padding-top: 1rem;
		border-top: 1px solid var(--ink);
	}
	h3 {
		font-family: var(--display);
		font-size: var(--step-2);
		font-weight: 600;
		letter-spacing: -0.02em;
		line-height: 1.05;
	}
	h3 a {
		text-decoration: none;
	}
	h3 a:hover {
		text-decoration: underline;
		text-decoration-color: var(--cyan);
	}
	.role {
		margin-top: 0.5rem;
		color: var(--ink-2);
		font-style: italic;
	}
	.what {
		margin-top: 0.6rem;
		color: var(--ink-2);
	}
	dl {
		display: grid;
		grid-template-columns: repeat(3, auto);
		justify-content: start;
		gap: 0.75rem 2rem;
		margin-top: 1.4rem;
	}
	@container (max-width: 21rem) {
		dl {
			grid-template-columns: repeat(2, auto);
		}
	}
	dl div {
		display: flex;
		flex-direction: column-reverse;
	}
	dd {
		font-family: var(--display);
		font-size: var(--step-1);
		font-weight: 600;
		line-height: 1.15;
		white-space: nowrap;
	}
	dt {
		font-size: var(--step--1);
		color: var(--muted);
		white-space: nowrap;
	}
	article .plot {
		margin-top: auto;
		padding-top: 1.25rem;
	}
	.plot path {
		fill: var(--s-ts);
		transition: opacity 0.15s;
	}
	.plot path.dim {
		opacity: 0.4;
	}
	.hit {
		fill: transparent;
	}
	.fine {
		margin-top: 1rem;
		font-size: var(--step--1);
		color: var(--muted);
	}
</style>
