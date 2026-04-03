import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-rangekeeper-50 via-white to-rangekeeper-100 px-4">
      {/* Hero */}
      <div className="mx-auto max-w-3xl text-center">
        {/* Logo / Wordmark */}
        <div className="mb-6 flex items-center justify-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rangekeeper-500 shadow-lg">
            <svg
              className="h-8 w-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg>
          </div>
          <span className="text-3xl font-bold tracking-tight text-rangekeeper-900">
            RangeKeeper
          </span>
        </div>

        {/* Tagline */}
        <h1 className="mb-4 text-5xl font-extrabold tracking-tight text-gray-900 sm:text-6xl">
          Stay on Track,{' '}
          <span className="text-rangekeeper-500">One Step at a Time</span>
        </h1>

        <p className="mx-auto mb-8 max-w-2xl text-xl text-gray-600">
          AI-powered academic planning built specifically for college students with ASD and ADHD.
          RangeKeeper syncs with Canvas, breaks assignments into manageable steps, and sends
          gentle nudges before things slip through the cracks.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/auth/signin"
            className="inline-flex items-center rounded-xl bg-rangekeeper-500 px-8 py-4 text-lg font-semibold text-white shadow-md transition hover:bg-rangekeeper-600 focus:outline-none focus:ring-2 focus:ring-rangekeeper-400 focus:ring-offset-2"
          >
            Get Started Free
            <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
          <Link
            href="/docs/ARCHITECTURE.md"
            className="inline-flex items-center rounded-xl border border-gray-200 bg-white px-8 py-4 text-lg font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
          >
            Learn How It Works
          </Link>
        </div>
      </div>

      {/* Feature Highlights */}
      <div className="mt-24 grid w-full max-w-4xl grid-cols-1 gap-8 sm:grid-cols-3">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-rangekeeper-100 text-rangekeeper-600">
              {feature.icon}
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">{feature.title}</h3>
            <p className="text-sm text-gray-500">{feature.description}</p>
          </div>
        ))}
      </div>

      {/* Footer */}
      <footer className="mt-24 text-center text-sm text-gray-400">
        <p>RangeKeeper · Built with care for neurodivergent students · License TBD</p>
      </footer>
    </main>
  );
}

const features = [
  {
    title: 'Canvas Sync',
    description:
      'Automatically pulls your assignments, due dates, and grades from Canvas LMS — no manual entry needed.',
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        />
      </svg>
    ),
  },
  {
    title: 'AI Task Decomposition',
    description:
      'Breaks overwhelming assignments into small, concrete steps sized for your daily energy levels.',
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
        />
      </svg>
    ),
  },
  {
    title: 'Smart Nudges',
    description:
      'Timely, non-overwhelming text reminders that adapt to your habits — not a flood of notifications.',
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
        />
      </svg>
    ),
  },
];
