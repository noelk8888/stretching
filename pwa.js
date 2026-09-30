(function () {
  'use strict';

  const status = document.getElementById('offline-status');
  let offlineReady = false;

  function setStatus(message, state = '') {
    if (!status) return;
    status.textContent = message;
    status.dataset.state = state;
  }

  function updateConnectivityStatus() {
    if (!navigator.onLine) {
      setStatus(offlineReady ? 'OFFLINE • READY' : 'OFFLINE MODE', offlineReady ? 'ready' : 'offline');
      return;
    }
    if (offlineReady) setStatus('OFFLINE READY', 'ready');
  }

  window.addEventListener('online', updateConnectivityStatus);
  window.addEventListener('offline', updateConnectivityStatus);

  if (!('serviceWorker' in navigator)) {
    setStatus('OFFLINE INSTALL NOT SUPPORTED', 'error');
    return;
  }

  navigator.serviceWorker.addEventListener('message', (event) => {
    const message = event.data || {};
    if (message.type === 'OFFLINE_CACHE_PROGRESS') {
      const percent = Math.round((message.completed / Math.max(1, message.total)) * 100);
      setStatus(`DOWNLOADING OFFLINE APP • ${percent}%`, 'working');
    }
    if (message.type === 'OFFLINE_CACHE_READY') {
      offlineReady = true;
      updateConnectivityStatus();
    }
    if (message.type === 'OFFLINE_CACHE_ERROR') {
      setStatus('OFFLINE DOWNLOAD INCOMPLETE • RECONNECT AND RELOAD', 'error');
    }
  });

  window.addEventListener('load', async () => {
    try {
      setStatus('PREPARING OFFLINE APP…', 'working');
      const registration = await navigator.serviceWorker.register('./sw.js');
      await navigator.serviceWorker.ready;
      const worker = registration.active || navigator.serviceWorker.controller;
      if (worker) worker.postMessage({ type: 'CHECK_OFFLINE_CACHE' });
    } catch (error) {
      console.warn('Offline installation failed', error);
      setStatus('OFFLINE DOWNLOAD INCOMPLETE • RECONNECT AND RELOAD', 'error');
    }
  });
})();
