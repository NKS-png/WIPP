import { renderers } from './renderers.mjs';
import { c as createExports, s as serverEntrypointModule } from './chunks/_@astrojs-ssr-adapter_CIMo3V1-.mjs';
import { manifest } from './manifest_Dt39_Bl9.mjs';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/404.astro.mjs');
const _page2 = () => import('./pages/about.astro.mjs');
const _page3 = () => import('./pages/api/add-sparks.astro.mjs');
const _page4 = () => import('./pages/api/auth/conversations/start.astro.mjs');
const _page5 = () => import('./pages/api/auth/login.astro.mjs');
const _page6 = () => import('./pages/api/auth/signout.astro.mjs');
const _page7 = () => import('./pages/api/auto-repair-conversation.astro.mjs');
const _page8 = () => import('./pages/api/check-conversation.astro.mjs');
const _page9 = () => import('./pages/api/community/join.astro.mjs');
const _page10 = () => import('./pages/api/community/leave.astro.mjs');
const _page11 = () => import('./pages/api/community/post.astro.mjs');
const _page12 = () => import('./pages/api/community/update.astro.mjs');
const _page13 = () => import('./pages/api/conversation-unread-counts.astro.mjs');
const _page14 = () => import('./pages/api/create-conversation.astro.mjs');
const _page15 = () => import('./pages/api/debug-conversation.astro.mjs');
const _page16 = () => import('./pages/api/debug-send-message.astro.mjs');
const _page17 = () => import('./pages/api/encryption/check-keys/_userid_.astro.mjs');
const _page18 = () => import('./pages/api/encryption/check-migration.astro.mjs');
const _page19 = () => import('./pages/api/encryption/get-keys/_userid_.astro.mjs');
const _page20 = () => import('./pages/api/encryption/get-public-key/_userid_.astro.mjs');
const _page21 = () => import('./pages/api/encryption/store-keys.astro.mjs');
const _page22 = () => import('./pages/api/get-messages.astro.mjs');
const _page23 = () => import('./pages/api/mark-messages-read.astro.mjs');
const _page24 = () => import('./pages/api/moderation/report.astro.mjs');
const _page25 = () => import('./pages/api/my-conversations.astro.mjs');
const _page26 = () => import('./pages/api/repair-conversation.astro.mjs');
const _page27 = () => import('./pages/api/search-users.astro.mjs');
const _page28 = () => import('./pages/api/send-encrypted-message.astro.mjs');
const _page29 = () => import('./pages/api/send-message.astro.mjs');
const _page30 = () => import('./pages/api/test-message.astro.mjs');
const _page31 = () => import('./pages/api/unread-count.astro.mjs');
const _page32 = () => import('./pages/api/upload-image.astro.mjs');
const _page33 = () => import('./pages/c/_id_.astro.mjs');
const _page34 = () => import('./pages/communities/create.astro.mjs');
const _page35 = () => import('./pages/communities.astro.mjs');
const _page36 = () => import('./pages/encryption-status.astro.mjs');
const _page37 = () => import('./pages/explore.astro.mjs');
const _page38 = () => import('./pages/inbox/messagebutton.astro.mjs');
const _page39 = () => import('./pages/inbox/_id_.astro.mjs');
const _page40 = () => import('./pages/inbox.astro.mjs');
const _page41 = () => import('./pages/login.astro.mjs');
const _page42 = () => import('./pages/post.astro.mjs');
const _page43 = () => import('./pages/profile/_id_.astro.mjs');
const _page44 = () => import('./pages/project/_id_.astro.mjs');
const _page45 = () => import('./pages/services.astro.mjs');
const _page46 = () => import('./pages/settings.astro.mjs');
const _page47 = () => import('./pages/signup.astro.mjs');
const _page48 = () => import('./pages/index.astro.mjs');
const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/generic.js", _page0],
    ["src/pages/404.astro", _page1],
    ["src/pages/about.astro", _page2],
    ["src/pages/api/add-sparks.ts", _page3],
    ["src/pages/api/auth/conversations/start.ts", _page4],
    ["src/pages/api/auth/login.ts", _page5],
    ["src/pages/api/auth/signout.ts", _page6],
    ["src/pages/api/auto-repair-conversation.ts", _page7],
    ["src/pages/api/check-conversation.ts", _page8],
    ["src/pages/api/community/join.ts", _page9],
    ["src/pages/api/community/leave.ts", _page10],
    ["src/pages/api/community/post.ts", _page11],
    ["src/pages/api/community/update.ts", _page12],
    ["src/pages/api/conversation-unread-counts.ts", _page13],
    ["src/pages/api/create-conversation.ts", _page14],
    ["src/pages/api/debug-conversation.ts", _page15],
    ["src/pages/api/debug-send-message.ts", _page16],
    ["src/pages/api/encryption/check-keys/[userId].ts", _page17],
    ["src/pages/api/encryption/check-migration.ts", _page18],
    ["src/pages/api/encryption/get-keys/[userId].ts", _page19],
    ["src/pages/api/encryption/get-public-key/[userId].ts", _page20],
    ["src/pages/api/encryption/store-keys.ts", _page21],
    ["src/pages/api/get-messages.ts", _page22],
    ["src/pages/api/mark-messages-read.ts", _page23],
    ["src/pages/api/moderation/report.ts", _page24],
    ["src/pages/api/my-conversations.ts", _page25],
    ["src/pages/api/repair-conversation.ts", _page26],
    ["src/pages/api/search-users.ts", _page27],
    ["src/pages/api/send-encrypted-message.ts", _page28],
    ["src/pages/api/send-message.ts", _page29],
    ["src/pages/api/test-message.ts", _page30],
    ["src/pages/api/unread-count.ts", _page31],
    ["src/pages/api/upload-image.ts", _page32],
    ["src/pages/c/[id].astro", _page33],
    ["src/pages/communities/create.astro", _page34],
    ["src/pages/communities/index.astro", _page35],
    ["src/pages/encryption-status.astro", _page36],
    ["src/pages/explore.astro", _page37],
    ["src/pages/inbox/messagebutton.astro", _page38],
    ["src/pages/inbox/[id].astro", _page39],
    ["src/pages/inbox/index.astro", _page40],
    ["src/pages/login.astro", _page41],
    ["src/pages/post.astro", _page42],
    ["src/pages/profile/[id].astro", _page43],
    ["src/pages/project/[id].astro", _page44],
    ["src/pages/services.astro", _page45],
    ["src/pages/settings.astro", _page46],
    ["src/pages/signup.astro", _page47],
    ["src/pages/index.astro", _page48]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    actions: () => import('./noop-entrypoint.mjs'),
    middleware: () => import('./_noop-middleware.mjs')
});
const _args = {
    "middlewareSecret": "4a874d90-729d-4746-afcd-f35b6b4615d2",
    "skewProtection": false
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;
const _start = 'start';
if (Object.prototype.hasOwnProperty.call(serverEntrypointModule, _start)) ;

export { __astrojsSsrVirtualEntry as default, pageMap };
