import { defineManifest } from '@crxjs/vite-plugin';
import packageJson from './package.json' with { type: 'json' };

const { version } = packageJson;

export default defineManifest({
  manifest_version: 3,
  name: 'Header Pilot',
  description: 'Add, remove, and modify request and response headers.',
  version,
  permissions: ['declarativeNetRequest', 'storage'],
  host_permissions: ['<all_urls>'],
  background: {
    service_worker: 'src/background/index.ts',
    type: 'module',
  },
  action: {
    default_popup: 'index.html',
  },
});
