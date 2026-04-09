const dns = require('dns');
try {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
    console.log('[env-patch] Overrode DNS servers to 8.8.8.8 to fix SRV resolution.');
} catch (e) {
    console.error('[env-patch] Failed to override DNS servers:', e.message);
}

try {
    if (typeof globalThis.localStorage !== 'undefined' && typeof globalThis.localStorage.getItem !== 'function') {
        Object.defineProperty(globalThis, 'localStorage', {
            value: {
                getItem: () => null,
                setItem: () => {},
                removeItem: () => {},
                clear: () => {}
            },
            writable: true,
            configurable: true
        });
        console.log('[env-patch] Patched global localStorage to prevent Next.js SSR crashes in Node 22+');
    }
    
    if (typeof globalThis.sessionStorage !== 'undefined' && typeof globalThis.sessionStorage.getItem !== 'function') {
        Object.defineProperty(globalThis, 'sessionStorage', {
            value: {
                getItem: () => null,
                setItem: () => {},
                removeItem: () => {},
                clear: () => {}
            },
            writable: true,
            configurable: true
        });
        console.log('[env-patch] Patched global sessionStorage to prevent Next.js SSR crashes in Node 22+');
    }
} catch(e) {
    console.error('[env-patch] Failed to patch localStorage:', e.message);
}

