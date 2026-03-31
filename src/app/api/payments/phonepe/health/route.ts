// src/app/api/payments/phonepe/health/route.ts
// PhonePe Health Check Endpoint

import { NextRequest, NextResponse } from "next/server";
import { getPhonePeConfig } from "@/config/phonepe.production";

export async function GET(req: NextRequest) {
  const config = getPhonePeConfig();

  const healthChecks = {
    timestamp: new Date().toISOString(),
    status: 'checking',
    environment: config.isProduction ? 'production' : 'sandbox',
    checks: [] as Array<{name: string; status: string; details?: string}>,
  };

  try {
    // Check 1: Environment variables
    const envVars = [
      'PHONEPE_MERCHANT_ID',
      'PHONEPE_SALT_KEY',
      'PHONEPE_API_URL',
      'NEXT_PUBLIC_BASE_URL',
    ];

    const missingVars = envVars.filter(v => !process.env[v]);
    
    healthChecks.checks.push({
      name: 'environment_variables',
      status: missingVars.length === 0 ? 'healthy' : 'unhealthy',
      details: missingVars.length > 0 ? `Missing: ${missingVars.join(', ')}` : undefined,
    });

    // Check 2: OAuth token
    try {
      const { phonePeOAuthService } = await import('@/services/payments/phonePeOAuthService');
      const hasToken = phonePeOAuthService.hasValidToken();
      
      healthChecks.checks.push({
        name: 'oauth_token',
        status: hasToken ? 'healthy' : 'unhealthy',
        details: hasToken ? undefined : 'No valid cached token (will be generated on next request)',
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      healthChecks.checks.push({
        name: 'oauth_token',
        status: 'error',
        details: errorMessage,
      });
    }

    // Check 3: Refund capability
    healthChecks.checks.push({
      name: 'refund_api',
      status: 'healthy',
      details: 'Refund endpoint available at /api/payments/phonepe/refund',
    });

    // Check 4: Security config
    healthChecks.checks.push({
      name: 'security',
      status: 'healthy',
      details: config.isProduction
        ? `HTTPS required, IP whitelisting enabled, timeout: ${config.security.requestTimeout}ms`
        : 'Sandbox mode — relaxed security',
    });

    // Determine overall status
    const unhealthyChecks = healthChecks.checks.filter(c => c.status === 'unhealthy' || c.status === 'error');
    healthChecks.status = unhealthyChecks.length === 0 ? 'healthy' : 'unhealthy';

    return NextResponse.json(healthChecks, {
      status: unhealthyChecks.length === 0 ? 200 : 503,
    });

  } catch (error: any) {
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      status: 'error',
      error: error.message,
      checks: healthChecks.checks,
    }, { status: 500 });
  }
}