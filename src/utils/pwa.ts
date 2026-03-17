// PWA utilities and helpers
import { toast } from 'sonner';

export function registerServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  // Không đăng ký SW trong môi trường dev để tránh cache chặn API calls và lỗi ServiceWorkerRegistration
  if (import.meta.env.DEV) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((r) => r.unregister().catch(() => {}));
    }).catch(() => {});
    return;
  }
  
  try {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
          
          // Check for updates every hour
          setInterval(() => {
            registration.update();
          }, 60 * 60 * 1000);

          // Listen for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New service worker available
                  showUpdateNotification();
                }
              });
            }
          });
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  } catch (error) {
    console.warn('Service worker registration failed:', error);
  }
}

export function unregisterServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error(error.message);
      });
  }
}

function showUpdateNotification() {
  toast('Update Available', {
    description: 'A new version is available. Refresh to update.',
    action: {
      label: 'Refresh',
      onClick: () => window.location.reload()
    },
    duration: Infinity
  });
}

// Install prompt
let deferredPrompt: any = null;

export function initInstallPrompt() {
  if (typeof window === 'undefined') return;
  
  try {
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      deferredPrompt = e;
      // Show install button
      showInstallPromotion();
    });

    window.addEventListener('appinstalled', () => {
      console.log('PWA was installed');
      deferredPrompt = null;
      hideInstallPromotion();
    });
  } catch (error) {
    console.warn('Install prompt initialization failed:', error);
  }
}

export async function showInstallPrompt() {
  if (!deferredPrompt) {
    return false;
  }

  // Show the install prompt
  deferredPrompt.prompt();
  
  // Wait for the user to respond to the prompt
  const { outcome } = await deferredPrompt.userChoice;
  
  console.log(`User response to the install prompt: ${outcome}`);
  
  // Clear the deferredPrompt
  deferredPrompt = null;
  
  return outcome === 'accepted';
}

function showInstallPromotion() {
  // Show install banner/button in UI
  const installBanner = document.getElementById('install-banner');
  if (installBanner) {
    installBanner.classList.remove('hidden');
  }
}

function hideInstallPromotion() {
  const installBanner = document.getElementById('install-banner');
  if (installBanner) {
    installBanner.classList.add('hidden');
  }
}

// Check if app is installed
export function isAppInstalled() {
  // Check if running in standalone mode
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return true;
  }
  
  // Check for iOS standalone
  if ((window.navigator as any).standalone === true) {
    return true;
  }
  
  return false;
}

// Check if device is online
export function isOnline() {
  return navigator.onLine;
}

// Listen for online/offline events
export function initNetworkListeners() {
  if (typeof window === 'undefined') return;
  
  try {
    window.addEventListener('online', () => {
      toast.success('Back Online', {
        description: 'Your connection has been restored.'
      });
    });

    window.addEventListener('offline', () => {
      toast.error('No Internet Connection', {
        description: 'Some features may be limited.',
        duration: Infinity
      });
    });
  } catch (error) {
    console.warn('Network listeners initialization failed:', error);
  }
}

// Request notification permission
export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

// Show local notification
export function showNotification(title: string, options?: NotificationOptions) {
  if (Notification.permission === 'granted') {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification(title, {
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-72x72.png',
          vibrate: [100, 50, 100],
          ...options
        });
      });
    } else {
      new Notification(title, {
        icon: '/icons/icon-192x192.png',
        ...options
      });
    }
  }
}

// Background sync
export async function registerBackgroundSync(tag: string) {
  if ('serviceWorker' in navigator && 'sync' in (self as any).registration) {
    const registration = await navigator.serviceWorker.ready;
    try {
      await (registration as any).sync.register(tag);
      console.log('Background sync registered:', tag);
    } catch (error) {
      console.error('Background sync registration failed:', error);
    }
  }
}

// Share API
export async function shareContent(data: { title?: string; text?: string; url?: string }) {
  if (navigator.share) {
    try {
      await navigator.share(data);
      return true;
    } catch (error) {
      console.error('Error sharing:', error);
      return false;
    }
  } else {
    // Fallback to clipboard
    if (data.url && navigator.clipboard) {
      await navigator.clipboard.writeText(data.url);
      toast.success('Link copied to clipboard!');
      return true;
    }
    return false;
  }
}

// Wake Lock API (keep screen on during lessons)
let wakeLock: any = null;

export async function requestWakeLock() {
  if ('wakeLock' in navigator) {
    try {
      wakeLock = await (navigator as any).wakeLock.request('screen');
      console.log('Wake Lock activated');
      
      wakeLock.addEventListener('release', () => {
        console.log('Wake Lock released');
      });
      
      return true;
    } catch (error) {
      console.error('Wake Lock request failed:', error);
      return false;
    }
  }
  return false;
}

export async function releaseWakeLock() {
  if (wakeLock) {
    await wakeLock.release();
    wakeLock = null;
  }
}

// Check for updates
export async function checkForUpdates() {
  if (import.meta.env.DEV || !('serviceWorker' in navigator)) return;
  const registration = await navigator.serviceWorker.ready;
  await registration.update();
}