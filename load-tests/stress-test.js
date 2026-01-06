import { check, sleep } from 'k6';
import http from 'k6/http';
import { Rate, Trend } from 'k6/metrics';

const successRate = new Rate('success_rate');
const responseTime = new Trend('response_time');

export const options = {
  stages: [
    { duration: '1m', target: 100 },
    { duration: '2m', target: 200 },
    { duration: '2m', target: 300 },
    { duration: '2m', target: 400 },
    { duration: '2m', target: 500 },
    { duration: '3m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(99)<2000'],
    success_rate: ['rate>0.90'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  // Health check under stress
  const healthRes = http.get(`${BASE_URL}/health`);
  
  const success = check(healthRes, {
    'health check passes': (r) => r.status === 200,
  });

  successRate.add(success);
  responseTime.add(healthRes.timings.duration);

  // Simulate seat availability check
  const flightId = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
  const seatsRes = http.get(`${BASE_URL}/api/flights/${flightId}/seats?status=available`);
  
  check(seatsRes, {
    'seats endpoint responds': (r) => r.status === 200,
  });

  sleep(0.5);
}

export function handleSummary(data) {
  return {
    'load-tests/results/stress-summary.json': JSON.stringify(data, null, 2),
  };
}
