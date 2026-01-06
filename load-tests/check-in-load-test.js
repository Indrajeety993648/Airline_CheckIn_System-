import { check, group, sleep } from 'k6';
import http from 'k6/http';
import { Counter, Rate, Trend } from 'k6/metrics';

// Custom metrics
const checkInSuccess = new Rate('check_in_success_rate');
const checkInDuration = new Trend('check_in_duration_ms');
const seatLockConflicts = new Counter('seat_lock_conflicts');

// Test configuration
export const options = {
  scenarios: {
    // Normal load baseline
    normal_load: {
      executor: 'constant-vus',
      vus: 50,
      duration: '2m',
      tags: { scenario: 'normal' },
    },
    // Spike test
    spike_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '10s', target: 200 },
        { duration: '30s', target: 200 },
        { duration: '10s', target: 50 },
      ],
      startTime: '2m30s',
      tags: { scenario: 'spike' },
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    http_req_failed: ['rate<0.01'],
    check_in_success_rate: ['rate>0.95'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

// Random generators
function randomPNR() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let pnr = '';
  for (let i = 0; i < 6; i++) {
    pnr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pnr;
}

function randomLastName() {
  const names = ['SHARMA', 'PATEL', 'SINGH', 'KUMAR', 'GUPTA', 'YADAV', 'VERMA', 'JAIN'];
  return names[Math.floor(Math.random() * names.length)];
}

// Main test
export default function () {
  const pnr = randomPNR();
  const lastName = randomLastName();
  const idempotencyKey = `${pnr}-${Date.now()}`;

  group('Check-In Flow', function () {
    // Step 1: Lookup
    const lookupRes = http.post(
      `${BASE_URL}/api/check-in/lookup`,
      JSON.stringify({ pnr, lastName }),
      { headers: { 'Content-Type': 'application/json' } }
    );

    check(lookupRes, {
      'lookup returns 200 or 404': (r) => [200, 404].includes(r.status),
    });

    sleep(1);

    // Step 2: Check-in
    const startTime = Date.now();
    const checkInRes = http.post(
      `${BASE_URL}/api/check-in`,
      JSON.stringify({
        pnr,
        lastName,
        seatPreference: { position: 'window' },
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': idempotencyKey,
        },
      }
    );

    const duration = Date.now() - startTime;
    checkInDuration.add(duration);

    const success = check(checkInRes, {
      'check-in response received': (r) => r.status !== 0,
      'response time < 500ms': (r) => r.timings.duration < 500,
    });

    checkInSuccess.add(success ? 1 : 0);

    if (checkInRes.status === 409) {
      seatLockConflicts.add(1);
    }
  });

  sleep(Math.random() * 2 + 1);
}

// Summary
export function handleSummary(data) {
  const metrics = data.metrics;
  
  console.log('\n========================================');
  console.log('  AIRLINE CHECK-IN LOAD TEST RESULTS');
  console.log('========================================\n');
  console.log(`Total Requests:    ${metrics.http_reqs?.values?.count || 0}`);
  console.log(`Requests/sec:      ${(metrics.http_reqs?.values?.rate || 0).toFixed(2)}`);
  console.log(`\nResponse Times:`);
  console.log(`  Average:         ${(metrics.http_req_duration?.values?.avg || 0).toFixed(2)}ms`);
  console.log(`  P95:             ${(metrics.http_req_duration?.values?.['p(95)'] || 0).toFixed(2)}ms`);
  console.log(`  P99:             ${(metrics.http_req_duration?.values?.['p(99)'] || 0).toFixed(2)}ms`);
  console.log(`\nSuccess Rate:      ${((1 - (metrics.http_req_failed?.values?.rate || 0)) * 100).toFixed(2)}%`);
  console.log(`Lock Conflicts:    ${metrics.seat_lock_conflicts?.values?.count || 0}`);
  console.log('\n========================================\n');

  return {
    'load-tests/results/summary.json': JSON.stringify(data, null, 2),
  };
}
