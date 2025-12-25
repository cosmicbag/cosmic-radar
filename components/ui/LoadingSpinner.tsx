interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
  };

  return (
    <div
      className={`animate-spin rounded-full border-accent border-t-transparent ${sizeClasses[size]} ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}

export function LoadingCard({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="card p-8 flex flex-col items-center justify-center min-h-[200px]">
      <LoadingSpinner size="lg" />
      <p className="mt-4 text-text-secondary">{message}</p>
    </div>
  );
}

export function LoadingPage({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" className="mx-auto" />
        <p className="mt-4 text-text-secondary text-lg">{message}</p>
      </div>
    </div>
  );
}
