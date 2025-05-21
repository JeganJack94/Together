import { useEffect, useState } from 'react';

// TypeScript does not have BeforeInstallPromptEvent by default, so we declare it here
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

export function useRegisterSW() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('ServiceWorker registered: ', registration);
          })
          .catch((error) => {
            console.log('ServiceWorker registration failed: ', error);
          });
      });
    }
  }, []);
}

export function PWAPrompt() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if prompt was previously dismissed
    const promptDismissed = localStorage.getItem('pwa-prompt-dismissed');
    if (promptDismissed) return;

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
      setIsVisible(true);

      // Auto-hide after 30 seconds
      setTimeout(() => {
        setIsVisible(false);
      }, 30000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  const handleInstallClick = () => {
    if (!installPrompt) return;
    
    installPrompt.prompt();
    installPrompt.userChoice.then((choiceResult: { outcome: string }) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
        localStorage.setItem('pwa-prompt-dismissed', 'true');
      }
      setInstallPrompt(null);
      setIsVisible(false);
    });
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 bg-white rounded-xl shadow-lg p-4 z-50 animate-slideUp">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-base">Install ToGether</h3>
          <p className="text-sm text-gray-500">Add to your home screen for quick access</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDismiss}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <i className="fas fa-times"></i>
          </button>
          <button
            onClick={handleInstallClick}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg"
          >
            Install
          </button>
        </div>
      </div>
    </div>
  );
}
