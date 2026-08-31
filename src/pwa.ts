import { registerSW } from 'virtual:pwa-register';

const UPDATE_INTERVAL_MS = 60 * 60 * 1000;

registerSW({
  immediate: true,
  onRegisteredSW(swUrl, registration) {
    if (!registration) return;

    const checkForUpdate = async () => {
      if (registration.installing || !navigator.onLine) return;

      try {
        const response = await fetch(swUrl, {
          cache: 'no-store',
          headers: {
            cache: 'no-store',
            'cache-control': 'no-cache',
          },
        });
        if (response.ok) await registration.update();
      } catch {
        // Offline or transient failures are retried at the next interval.
      }
    };

    window.setInterval(() => void checkForUpdate(), UPDATE_INTERVAL_MS);
  },
});
