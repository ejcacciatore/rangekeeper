import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { getArticleBySlug } from '@/lib/research';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');

  if (!slug) {
    return new Response('Missing slug parameter', { status: 400 });
  }

  const article = await getArticleBySlug(slug);

  if (!article) {
    return new Response('Article not found', { status: 404 });
  }

  const BRAND_GREEN = '#00FF41';

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#000',
          padding: '60px',
          fontFamily: 'monospace',
        }}
      >
        {/* Background grid pattern */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `linear-gradient(${BRAND_GREEN}22 1px, transparent 1px), linear-gradient(90deg, ${BRAND_GREEN}22 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />

        {/* Content */}
        <div style={{ display: 'flex', flexDirection: 'column', zIndex: 1 }}>
          <div
            style={{
              fontSize: 32,
              color: BRAND_GREEN,
              fontWeight: 'bold',
              marginBottom: '20px',
              textTransform: 'uppercase',
              letterSpacing: '2px',
            }}
          >
            SAPINOVER RESEARCH
          </div>

          <div
            style={{
              fontSize: 64,
              fontWeight: 'bold',
              color: '#fff',
              lineHeight: 1.2,
              marginBottom: '30px',
              maxWidth: '900px',
            }}
          >
            {article.title}
          </div>

          <div
            style={{
              fontSize: 28,
              color: '#888',
              lineHeight: 1.5,
              maxWidth: '900px',
            }}
          >
            {article.excerpt}
          </div>

          <div
            style={{
              marginTop: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              fontSize: 24,
              color: '#666',
            }}
          >
            <span>{article.author}</span>
            <span>•</span>
            <span>{article.readingTime}</span>
            <span>•</span>
            <span>{new Date(article.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
          </div>
        </div>

        {/* Bottom accent */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '8px',
            backgroundColor: BRAND_GREEN,
          }}
        />
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
