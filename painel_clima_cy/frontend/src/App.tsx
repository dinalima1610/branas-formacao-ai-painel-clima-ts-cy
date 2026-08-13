import { useEffect, useState } from 'react';
import { WeatherPanel } from './features/weather-panel';
import { buildApiUrl } from './lib/api-config';

type ApiStatus = 'checking' | 'online' | 'offline';

const apiStatusConfig: Record<ApiStatus, { indicatorClassName: string; label: string }> = {
  checking: {
    indicatorClassName: 'bg-warning',
    label: 'checking',
  },
  offline: {
    indicatorClassName: 'bg-error',
    label: 'offline',
  },
  online: {
    indicatorClassName: 'bg-success',
    label: 'online',
  },
};

function App() {
  const [apiStatus, setApiStatus] = useState<ApiStatus>('checking');
  const statusConfig = apiStatusConfig[apiStatus];

  useEffect(() => {
    const healthUrl = buildApiUrl('/health');

    const checkApiStatus = async () => {
      try {
        const response = await fetch(healthUrl);
        if (response.ok) {
          setApiStatus('online');
        } else {
          setApiStatus('offline');
        }
      } catch {
        setApiStatus('offline');
      }
    };

    void checkApiStatus();
    const interval = setInterval(() => {
      void checkApiStatus();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-canvas text-foreground">
      <main className="flex min-h-screen items-start justify-center px-0 pb-24 pt-4 sm:pt-6 lg:items-center lg:py-10">
        <WeatherPanel />
      </main>

      <div className="fixed inset-x-4 bottom-4 z-10 flex justify-center sm:bottom-8">
        <div
          aria-label={`API Status: ${statusConfig.label}`}
          className="flex items-center gap-2 rounded-full border border-hairline bg-canvas/90 px-4 py-2 backdrop-blur-sm"
          role="status"
        >
          <span
            aria-hidden="true"
            className={`size-3 rounded-full ${statusConfig.indicatorClassName} animate-pulse`}
            data-testid="api-status-indicator"
          />
          <span className="text-sm font-normal text-muted-foreground">API Status</span>
          <span className="sr-only">{statusConfig.label}</span>
        </div>
      </div>
    </div>
  );
}

export default App;
