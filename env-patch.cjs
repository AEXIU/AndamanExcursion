const dns = require('dns');
try {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
    console.log('[env-patch] Overrode DNS servers to 8.8.8.8 to fix SRV resolution.');
} catch (e) {
    console.error('[env-patch] Failed to override DNS servers:', e.message);
}
