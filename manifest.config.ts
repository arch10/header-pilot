import { defineManifest } from '@crxjs/vite-plugin';
import packageJson from './package.json' with { type: 'json' };

const { version } = packageJson;

const icons = {
  16: 'public/icons/icon-16.png',
  32: 'public/icons/icon-32.png',
  48: 'public/icons/icon-48.png',
  128: 'public/icons/icon-128.png',
};

const disabledIcons = [
  'public/icons/icon-16-disabled.png',
  'public/icons/icon-32-disabled.png',
  'public/icons/icon-48-disabled.png',
  'public/icons/icon-128-disabled.png',
];

export default defineManifest({
  manifest_version: 3,
  name: 'Header Pilot',
  description: 'Add, remove, and modify request and response headers.',
  version,
  icons,
  permissions: ['declarativeNetRequest', 'storage'],
  host_permissions: ['<all_urls>'],
  background: {
    service_worker: 'src/background/index.ts',
    type: 'module',
  },
  action: {
    default_popup: 'index.html',
    default_icon: icons,
  },
  // Disabled icon variants aren't referenced by any manifest field crxjs
  // rewrites, so list them here to make sure they're copied into dist/ and
  // reachable via chrome.action.setIcon at runtime.
  web_accessible_resources: [
    {
      resources: disabledIcons,
      matches: ['<all_urls>'],
    },
  ],
});
