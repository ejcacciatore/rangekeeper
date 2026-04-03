import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import Link from 'next/link';
import { getAllArticles, getArticleBySlug } from '@/lib/research';

type Props = {
  params: { slug: string };
};

export async function generateStaticParams() {
  const articles = await getAllArticles();
  return articles.map((article) => ({
    slug: article.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await getArticleBySlug(params.slug);

  if (!article) {
    return {
      title: 'Article Not Found - SAPINOVER',
    };
  }

  const ogImage = `/research/og?slug=${params.slug}`;

  return {
    title: `${article.title} - SAPINOVER Research`,
    description: article.excerpt,
    authors: [{ name: article.author }],
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: 'article',
      publishedTime: article.publishedAt,
      authors: [article.author],
      images: [{ url: ogImage }],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt,
      images: [ogImage],
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const article = await getArticleBySlug(params.slug);

  if (!article) {
    notFound();
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    author: {
      '@type': 'Person',
      name: article.author,
    },
    datePublished: article.publishedAt,
    publisher: {
      '@type': 'Organization',
      name: 'SAPINOVER',
      logo: {
        '@type': 'ImageObject',
        url: 'https://sapinover-site.vercel.app/logo.png',
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="min-h-screen bg-black text-white">
        <article className="max-w-3xl mx-auto px-4 py-16">
          <Link
            href="/research"
            className="inline-flex items-center gap-2 text-[#00FF41] hover:underline mb-8"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Research
          </Link>

          <header className="mb-12">
            <time className="text-sm text-gray-500 font-mono">
              {new Date(article.publishedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
            <h1 className="text-4xl md:text-5xl font-bold mt-4 mb-6 leading-tight">
              {article.title}
            </h1>
            <div className="flex items-center gap-4 text-gray-400">
              <span className="font-medium">{article.author}</span>
              <span>•</span>
              <span>{article.readingTime}</span>
            </div>
          </header>

          <div className="prose prose-invert prose-lg max-w-none">
            <style jsx global>{`
              .prose h2 {
                color: #00FF41;
                font-weight: 700;
                margin-top: 2em;
                margin-bottom: 1em;
              }
              .prose h3 {
                color: #00FF41;
                font-weight: 600;
                margin-top: 1.5em;
                margin-bottom: 0.75em;
              }
              .prose a {
                color: #00FF41;
                text-decoration: underline;
              }
              .prose a:hover {
                opacity: 0.8;
              }
              .prose strong {
                color: white;
                font-weight: 600;
              }
              .prose code {
                background: #1a1a1a;
                padding: 0.2em 0.4em;
                border-radius: 4px;
                font-size: 0.9em;
                color: #00FF41;
              }
              .prose pre {
                background: #1a1a1a;
                border: 1px solid #333;
                border-radius: 8px;
              }
              .prose blockquote {
                border-left: 4px solid #00FF41;
                padding-left: 1em;
                font-style: italic;
                color: #888;
              }
            `}</style>
            <MDXRemote source={article.content} />
          </div>

          <footer className="mt-16 pt-8 border-t border-gray-800">
            <div className="flex items-center justify-between">
              <Link
                href="/research"
                className="text-[#00FF41] hover:underline"
              >
                ← More Research
              </Link>
              <Link
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(`https://sapinover-site.vercel.app/research/${params.slug}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-[#00FF41] transition-colors"
              >
                Share on Twitter →
              </Link>
            </div>
          </footer>
        </article>
      </main>
    </>
  );
}
