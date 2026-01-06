import { check, sleep } from 'k6';
import http from 'k6/http';

export const options = {
  stages: [
    { duration: '10s', target: 10 },    // Warm up
    { duration: '1s', target: 500 },    // Spike!
    { duration: '30s', target: 500 },   // Stay at spike
    { duration: '10s', target: 10 },    // Scale down
    { duration: '30s', target: 10 },    // Recovery
  ],
  thresholds: {
    http_req_failed: ['rate<0.10'],     // Allow 10% failure during spike
    http_req_duration: ['p(95)<3000'],  // 3s max during spike
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  const res = http.get(`${BASE_URL}/health`);
  
  check(res, {
    'service available during spike': (r) => r.status === 200,
  });

  sleep(0.1);
}
