import { createApp } from './app';

const PORT = parseInt(process.env.PORT ?? '3000', 10);
const HOST = process.env.HOST ?? '0.0.0.0';

const app = createApp();

app.listen(PORT, HOST, () => {
  console.log('');
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║       Converged Media Planning API – Dev Server      ║');
  console.log('╚══════════════════════════════════════════════════════╝');
  console.log(`  Listening on  http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}`);
  console.log(`  Bearer token  ${process.env.BEARER_TOKEN ?? 'demo-token'}`);
  console.log('');
  console.log('  Endpoints:');
  console.log('    POST  /v1/campaigns');
  console.log('    GET   /v1/campaigns?advertiserId=&[status=]');
  console.log('    GET   /v1/media-plans/?planId=');
  console.log('    GET   /health');
  console.log('');
});
