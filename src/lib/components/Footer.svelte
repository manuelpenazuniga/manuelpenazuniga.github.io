<script>
	import { site } from '#lib/content.js';
	import activity from '#lib/data/activity.json';
</script>

<footer class="wrap band" id="contact">
	<h2>Contact</h2>
	<div class="band-body">
		<div class="hello">
			<picture>
				<source srcset="/avatar.avif" type="image/avif" />
				<img src="/avatar.jpg" width="96" height="96" alt="Illustration of an alpaca in glasses working at a laptop" loading="lazy" />
			</picture>
			<p>Santiago, Chile, UTC−4. LinkedIn or Telegram is the fastest way to reach me.</p>
		</div>
		<ul class="links">
			{#each site.links as l}
				<li><a href={l.href} rel="me">{l.label}</a></li>
			{/each}
		</ul>
		<p class="fine">
			Charts rebuilt from my commit history on {activity.generated}. This page is
			<a href="{site.github}/manuelpenazuniga.github.io">open source</a>, and it has a terminal if you
			know which key to press.
		</p>
	</div>
</footer>

<style>
	.hello {
		display: flex;
		align-items: center;
		gap: 1.25rem;
	}
	img {
		display: block;
		border-radius: 50%;
		width: 5rem;
		height: 5rem;
	}
	.hello p {
		font-size: var(--step-1);
		line-height: 1.3;
		max-width: 32ch;
	}
	.links {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem 1.5rem;
		margin-top: 2rem;
	}
	.fine {
		margin-top: 2.5rem;
		font-size: var(--step--1);
		color: var(--muted);
		max-width: var(--measure);
	}
</style>
