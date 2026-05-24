const http = require('http');

const handlers = {
  '/api/hackathons': (url) => {
    const ids = new URL(url, 'http://localhost').searchParams.get('ids');
    const data = ids
      ? ids.split(',').map(id => ({ _id: id, name: 'Mock Hackathon', status: 'UPCOMING', mode: 'ONLINE', startDate: new Date().toISOString(), endDate: new Date(Date.now() + 86400000).toISOString(), location: 'Virtual', description: 'Mock description', themes: ['AI'], organizer: 'Mock Organizer', registrationLink: 'https://example.com', registrationLinkOverride: false, isRegistrationLinkBroken: false }))
      : [];
    return JSON.stringify({ success: true, data, pagination: { page: 1, limit: 12, total: 0, totalPages: 1 } });
  },
  '/api/hackathons/deleted': () => JSON.stringify({ success: true, data: [] }),
  '/api/analytics': () => JSON.stringify({ success: true, totals: { hackathons: 0, views: 0, clicks: 0 }, trends: [] }),
  '/api/submissions': () => JSON.stringify({ success: true, data: [], pagination: { page: 1, limit: 12, total: 0, totalPages: 1 } }),
  '/api/feedback': () => JSON.stringify({ success: true, data: [] }),
  '/api/notifications': () => JSON.stringify({ success: true, data: [] }),
};

http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  const handler = handlers[req.url.split('?')[0]];
  if (handler) {
    res.end(handler(req.url));
  } else {
    res.statusCode = 200;
    res.end(JSON.stringify({ success: true }));
  }
}).listen(5000, () => process.stdout.write('Mock API server on :5000\n'));
