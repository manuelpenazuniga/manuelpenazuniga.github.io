// Refreshes src/lib/data before a build. Every source is optional: if one
// fails, the file already in the repo is kept and the build still works.
//
//   activity.json       aggregates published by my profile repo
//   contributions.json  the last year's contribution calendar (needs GITHUB_TOKEN)
//   posts.json          Medium and Substack, merged with what we already have,
//                       because their feeds only carry the most recent posts
import { readFile, writeFile } from 'node:fs/promises';

const USER = 'manuelpenazuniga';
const DATA = new URL('../src/lib/data/', import.meta.url);
const FEEDS = [
	{ source: 'Medium', url: 'https://medium.com/feed/@manuelpz.dev' },
	{ source: 'Substack', url: 'https://manuelpzdev.substack.com/feed' }
];
const SKIP_TITLES = new Set(['coming soon']); // Substack's placeholder post

const read = async (name, fallback) => {
	try {
		return JSON.parse(await readFile(new URL(name, DATA), 'utf8'));
	} catch {
		return fallback;
	}
};
const write = (name, value) => writeFile(new URL(name, DATA), JSON.stringify(value, null, '\t') + '\n');
const get = async (url, init = {}) => {
	const res = await fetch(url, { ...init, headers: { 'user-agent': `${USER}.github.io build`, ...init.headers }, signal: AbortSignal.timeout(20_000) });
	if (!res.ok) throw new Error(`${res.status} ${url}`);
	return res;
};
const attempt = async (name, fn) => {
	try {
		console.log(`${name}: ${await fn()}`);
	} catch (err) {
		console.warn(`${name}: kept the existing file (${err.message})`);
	}
};

const unescape = (s) =>
	s
		.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
		.replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
		.replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
		.replace(/&quot;/g, '"')
		.replace(/&apos;/g, "'")
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&amp;/g, '&')
		.trim();
const tag = (xml, name) => unescape(xml.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`))?.[1] ?? '');

function parseFeed(xml, source) {
	const posts = [];
	for (const [, item] of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
		const title = tag(item, 'title');
		const date = new Date(tag(item, 'pubDate'));
		let url;
		try {
			url = new URL(tag(item, 'link'));
		} catch {
			continue;
		}
		// feed content is somebody else's server talking: only keep plain https links
		if (url.protocol !== 'https:' || !title || Number.isNaN(+date)) continue;
		if (SKIP_TITLES.has(title.toLowerCase())) continue;
		url.search = ''; // drop tracking parameters
		posts.push({ title: title.slice(0, 200), url: url.href, date: date.toISOString().slice(0, 10), source });
	}
	return posts;
}

await attempt('activity', async () => {
	const res = await get(`https://raw.githubusercontent.com/${USER}/${USER}/HEAD/data/activity.json`);
	const data = await res.json();
	if (typeof data.commits !== 'number' || !data.strata || !data.clock) throw new Error('unexpected shape');
	await write('activity.json', data);
	return `${data.commits} commits, generated ${data.generated}`;
});

await attempt('contributions', async () => {
	const token = process.env.GITHUB_TOKEN;
	if (!token) throw new Error('GITHUB_TOKEN not set');
	const query = `{user(login:"${USER}"){contributionsCollection{contributionCalendar{totalContributions weeks{contributionDays{date contributionCount}}}}}}`;
	const res = await get('https://api.github.com/graphql', {
		method: 'POST',
		headers: { authorization: `bearer ${token}`, 'content-type': 'application/json' },
		body: JSON.stringify({ query })
	});
	const cal = (await res.json()).data.user.contributionsCollection.contributionCalendar;
	const days = cal.weeks.flatMap((w) => w.contributionDays.map((d) => [d.date, d.contributionCount]));
	await write('contributions.json', { total: cal.totalContributions, days });
	return `${cal.totalContributions} in ${days.length} days`;
});

await attempt('posts', async () => {
	const byUrl = new Map((await read('posts.json', [])).map((p) => [p.url, p]));
	const before = byUrl.size;
	const results = await Promise.allSettled(FEEDS.map(async (f) => parseFeed(await (await get(f.url)).text(), f.source)));
	if (results.every((r) => r.status === 'rejected')) throw new Error(results[0].reason.message);
	for (const r of results) if (r.status === 'fulfilled') for (const p of r.value) byUrl.set(p.url, p);
	const posts = [...byUrl.values()].sort((a, b) => b.date.localeCompare(a.date));
	await write('posts.json', posts);
	return `${posts.length} posts (${posts.length - before} new)`;
});
