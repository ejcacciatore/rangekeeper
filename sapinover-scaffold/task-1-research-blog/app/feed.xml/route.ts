import { getAllArticles } from '@/lib/research';

export async function GET() {
  const articles = await getAllArticles();
  const siteUrl = 'https://sapinover-site.vercel.app';

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>SAPINOVER Research</title>
    <link>${siteUrl}/research</link>
    <description>Intelligence from the overnight markets. Analysis that matters.</description>
    <language>en-us</language>
    <atom:link href="${siteUrl}/research/feed.xml" rel="self" type="application/rss+xml"/>
    ${articles
      .map(
        (article) => `
    <item>
      <title><![CDATA[${article.title}]]></title>
      <link>${siteUrl}/research/${article.slug}</link>
      <guid isPermaLink="true">${siteUrl}/research/${article.slug}</guid>
      <description><![CDATA[${article.excerpt}]]></description>
      <pubDate>${new Date(article.publishedAt).toUTCString()}</pubDate>
      <author>${article.author}</author>
    </item>`
      )
      .join('')}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
