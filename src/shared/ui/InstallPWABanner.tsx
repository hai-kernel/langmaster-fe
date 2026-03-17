import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Download, X, Smartphone } from 'lucide-react';
import { showInstallPrompt, isAppInstalled } from '@/utils/pwa';

export function InstallPWABanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (isAppInstalled()) {
      return;
    }

    // Check if user has dismissed the banner before
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
      
      // Show again after 7 days
      if (daysSinceDismissed < 7) {
        return;
      }
    }

    // Show banner after 30 seconds
    const timer = setTimeout(() => {
      setShowBanner(true);
    }, 30000);

    return () => clearTimeout(timer);
  }, []);

  const handleInstall = async () => {
    setIsInstalling(true);
    const installed = await showInstallPrompt();
    
    if (installed) {
      setShowBanner(false);
      localStorage.removeItem('pwa-install-dismissed');
    }
    
    setIsInstalling(false);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 z-50 max-w-md"
          id="install-banner"
        >
          <Card className="p-4 shadow-2xl border-2 border-green-500 bg-gradient-to-br from-white to-green-50 dark:from-gray-900 dark:to-green-900/20">
            <div className="flex items-start gap-4">
              <div className="size-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center flex-shrink-0">
                <Smartphone className="size-6 text-white" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm mb-1">Install English AI</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                  Get quick access and learn offline! Install our app for the best experience.
                </p>
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleInstall}
                    disabled={isInstalling}
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                  >
                    <Download className="size-3 mr-1" />
                    {isInstalling ? 'Installing...' : 'Install'}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleDismiss}
                  >
                    Not now
                  </Button>
                </div>
              </div>
              
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDismiss}
                className="size-6 p-0 flex-shrink-0"
              >
                <X className="size-4" />
              </Button>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Compact version for iOS (since they don't support install prompt)
export function InstallPWABanneriOS() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if iOS and not in standalone mode
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isInStandaloneMode = (window.navigator as any).standalone === true;
    
    if (isIOS && !isInStandaloneMode) {
      const dismissed = localStorage.getItem('pwa-install-ios-dismissed');
      if (!dismissed) {
        setTimeout(() => setShowBanner(true), 10000);
      }
    }
  }, []);

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('pwa-install-ios-dismissed', 'true');
  };

  if (!showBanner) return null;

  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -100, opacity: 0 }}
      className="fixed top-4 left-4 right-4 z-50 max-w-md mx-auto"
    >
      <Card className="p-4 shadow-2xl border-2 border-green-500 bg-gradient-to-br from-white to-green-50 dark:from-gray-900 dark:to-green-900/20">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <h3 className="font-semibold text-sm mb-1">Install English AI</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Tap <span className="inline-block mx-1">
                <svg className="inline size-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a1 1 0 011 1v5.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 111.414-1.414L9 8.586V3a1 1 0 011-1z"/>
                  <path d="M3 14a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"/>
                </svg>
              </span> then "Add to Home Screen"
            </p>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDismiss}
            className="size-6 p-0"
          >
            <X className="size-4" />
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}
