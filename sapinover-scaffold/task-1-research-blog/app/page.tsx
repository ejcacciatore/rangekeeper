import { Metadata } from 'next';
import Link from 'next/link';
import { getAllArticles } from '@/lib/research';

export const metadata: Metadata = {
  title: 'Research - SAPINOVER',
  description: 'In-depth analysis of overnight trading, ATS volume, geopolitical risk, and 24-hour market intelligence.',
  openGraph: {
    title: 'Research - SAPINOVER',
    description: 'In-depth analysis of overnight trading, ATS volume, geopolitical risk, and 24-hour market intelligence.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Research - SAPINOVER',
    description: 'In-depth analysis of overnight trading, ATS volume, geopolitical risk, and 24-hour market intelligence.',
  },
  alternates: {
    types: {
      'application/rss+xml': '/research/feed.xml',
    },
  },
};

export default async function ResearchPage() {
  const articles = await getAllArticles();

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <header className="mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            Research
          </h1>
          <p className="text-xl text-gray-400">
            Intelligence from the overnight markets. Analysis that matters.
          </p>
          <Link
            href="/research/feed.xml"
            className="inline-flex items-center gap-2 mt-4 text-[#00FF41] hover:underline"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6.503 20.752c0 1.794-1.456 3.248-3.251 3.248-1.796 0-3.252-1.454-3.252-3.248 0-1.794 1.456-3.248 3.252-3.248 1.795.001 3.251 1.454 3.251 3.248zm-6.503-12.572v4.811c6.05.062 10.96 4.966 11.022 11.009h4.817c-.062-8.71-7.118-15.758-15.839-15.82zm0-3.368c10.58.046 19.152 8.594 19.183 19.188h4.817c-.03-13.231-10.755-23.954-24-24v4.812z"/>
            </svg>
            Subscribe via RSS
          </Link>
        </header>

        <div className="space-y-12">
          {articles.map((article) => (
            <article key={article.slug} className="border-l-2 border-[#00FF41] pl-6 py-2">
              <Link href={`/research/${article.slug}`}>
                <time className="text-sm text-gray-500 font-mono">
                  {new Date(article.publishedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </time>
                <h2 className="text-2xl md:text-3xl font-bold mt-2 mb-3 hover:text-[#00FF41] transition-colors">
                  {article.title}
                </h2>
                <p className="text-gray-400 mb-4 leading-relaxed">
                  {article.excerpt}
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>{article.author}</span>
                  <span>•</span>
                  <span>{article.readingTime}</span>
                </div>
              </Link>
            </article>
          ))}
        </div>

        {articles.length === 0 && (
          <div className="text-center py-16 text-gray-500">
            <p>No research articles yet. Check back soon.</p>
          </div>
        )}
      </div>
    </main>
  );
}
