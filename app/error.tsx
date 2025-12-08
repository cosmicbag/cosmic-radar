'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="card max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-negative">
          ⚠️ Something went wrong!
        </h2>
        <p className="text-text-secondary mb-4">
          The dashboard encountered an error while loading.
        </p>
        <div className="bg-background p-4 rounded-lg mb-4">
          <p className="text-sm font-mono text-text-secondary break-all">
            {error.message}
          </p>
        </div>
        <button
          onClick={reset}
          className="w-full px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
        >
          Try Again
        </button>
        <a
          href="/"
          className="block text-center mt-4 text-sm text-accent hover:text-accent/80 transition-colors"
        >
          ← Back to Home
        </a>
      </div>
    </div>
  );
}
