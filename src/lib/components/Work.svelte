<script>
	import { veins } from '#lib/content.js';
	import { seriesLabel } from '#lib/series.js';
</script>

<section id="work" class="wrap band">
	<h2>Work</h2>
	<div class="band-body">
		{#each veins as vein, v}
			<article class="vein">
				<header>
					<span class="label">{['I', 'II', 'III', 'IV'][v]}</span>
					<h3>{vein.title}</h3>
					<p class="lead">{vein.lead}</p>
				</header>
				<table>
					<thead>
						<tr>
							<th scope="col">Project</th>
							<th scope="col">What it does</th>
							<th scope="col">What decides</th>
						</tr>
					</thead>
					<tbody>
						{#each vein.projects as p}
							<tr>
								<th scope="row">
									<a href={p.href}>{p.name}</a>
									<span class="lang label">{seriesLabel[p.lang]}</span>
								</th>
								<td>{p.what}</td>
								<td class="decides">{p.decides}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</article>
		{/each}
	</div>
</section>

<style>
	.vein + .vein {
		margin-top: clamp(2.5rem, 6vw, 4.5rem);
	}
	header .label {
		display: block;
		margin-bottom: 0.35rem;
	}
	h3 {
		font-family: var(--display);
		font-size: var(--step-2);
		font-weight: 600;
		letter-spacing: -0.02em;
	}
	.lead {
		margin-top: 0.6rem;
	}
	table {
		width: 100%;
		margin-top: 1.5rem;
		border-collapse: collapse;
		text-align: left;
	}
	thead th {
		padding-bottom: 0.5rem;
		font-size: var(--step--1);
		font-weight: 400;
		color: var(--muted);
	}
	tbody tr {
		border-top: 1px solid var(--line);
	}
	th,
	td {
		padding: 1rem 1.5rem 1rem 0;
		vertical-align: top;
	}
	tbody th {
		width: 12rem;
		font-weight: 700;
	}
	tbody th a {
		font-size: var(--step-1);
		text-decoration: none;
	}
	tbody th a:hover {
		text-decoration: underline;
		text-decoration-color: var(--cyan);
	}
	.lang {
		display: block;
		margin-top: 0.3rem;
		text-transform: uppercase;
	}
	td {
		color: var(--ink-2);
	}
	.decides {
		width: 15rem;
		padding-right: 0;
		color: var(--ink);
	}
	/* on a phone each project becomes a stacked note, and the third column names itself */
	@media (max-width: 46rem) {
		thead {
			display: none;
		}
		tbody tr {
			display: grid;
			gap: 0.4rem;
			padding-block: 1rem;
		}
		th,
		td {
			padding: 0;
		}
		tbody th,
		.decides {
			width: auto;
		}
		.decides:not(:empty)::before {
			content: 'Decides: ';
			color: var(--muted);
		}
		.decides:empty {
			display: none;
		}
	}
</style>
