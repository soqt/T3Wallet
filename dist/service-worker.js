"use strict";var precacheConfig=[["/static/common-umi.6d3d43cc.async.js","42f94387be431c3be7a74ffa106612e1"],["/static/src__layouts__index.578bb0fa.async.js","c89e0d6d5f3025e82645a6f48c77fa60"],["/static/src__pages__404.e993b784.async.js","0a65d33336730d347d20720d48ea794a"],["/static/src__pages__access-wallet__index.f630931f.async.js","de93c3186f826af76ce52bb32e27d3f8"],["/static/src__pages__access-wallet__models__accessWallet.js.59d5e9cb.async.js","04d48b12cd06af9b33fa4c53446b58c0"],["/static/src__pages__access-wallet__my-account__index.0762236d.async.js","28c7ce3f7fb91b2e6274dbd1515c2fcc"],["/static/src__pages__access-wallet__my-account__models__myAccount.js.fe7e308c.async.js","a2cf9e5277674d6a950205fbefd74167"],["/static/src__pages__create-wallet__index.3a9e5061.async.js","4dc4e9fffc29c1f60d0e02306eb6168c"],["/static/src__pages__create-wallet__models__createWallet.js.673c0ee8.async.js","4455b43bab5810dac322c42477a944fe"],["/static/src__pages__index.d4bb928f.async.js","ef66a495bfc858bda83d7a54ecc92820"],["/static/static/logo.7510241f.png","7510241f561c424d2794c05679f12d28"],["/static/umi.b883e77a.js","412d7891ecef9f14781cebf25c4ef537"],["/static/umi.fb8c9854.css","fb8c9854f8f2a56a949e015bafc10c7a"]],cacheName="sw-precache-v3-sw-precache-webpack-plugin-"+(self.registration?self.registration.scope:""),ignoreUrlParametersMatching=[/^utm_/],addDirectoryIndex=function(e,t){var n=new URL(e);return"/"===n.pathname.slice(-1)&&(n.pathname+=t),n.toString()},cleanResponse=function(e){return e.redirected?("body"in e?Promise.resolve(e.body):e.blob()).then(function(t){return new Response(t,{headers:e.headers,status:e.status,statusText:e.statusText})}):Promise.resolve(e)},createCacheKey=function(e,t,n,a){var c=new URL(e);return a&&c.pathname.match(a)||(c.search+=(c.search?"&":"")+encodeURIComponent(t)+"="+encodeURIComponent(n)),c.toString()},isPathWhitelisted=function(e,t){if(0===e.length)return!0;var n=new URL(t).pathname;return e.some(function(e){return n.match(e)})},stripIgnoredUrlParameters=function(e,t){var n=new URL(e);return n.hash="",n.search=n.search.slice(1).split("&").map(function(e){return e.split("=")}).filter(function(e){return t.every(function(t){return!t.test(e[0])})}).map(function(e){return e.join("=")}).join("&"),n.toString()},hashParamName="_sw-precache",urlsToCacheKeys=new Map(precacheConfig.map(function(e){var t=e[0],n=e[1],a=new URL(t,self.location),c=createCacheKey(a,hashParamName,n,!1);return[a.toString(),c]}));function setOfCachedUrls(e){return e.keys().then(function(e){return e.map(function(e){return e.url})}).then(function(e){return new Set(e)})}self.addEventListener("install",function(e){e.waitUntil(caches.open(cacheName).then(function(e){return setOfCachedUrls(e).then(function(t){return Promise.all(Array.from(urlsToCacheKeys.values()).map(function(n){if(!t.has(n)){var a=new Request(n,{credentials:"same-origin"});return fetch(a).then(function(t){if(!t.ok)throw new Error("Request for "+n+" returned a response with status "+t.status);return cleanResponse(t).then(function(t){return e.put(n,t)})})}}))})}).then(function(){return self.skipWaiting()}))}),self.addEventListener("activate",function(e){var t=new Set(urlsToCacheKeys.values());e.waitUntil(caches.open(cacheName).then(function(e){return e.keys().then(function(n){return Promise.all(n.map(function(n){if(!t.has(n.url))return e.delete(n)}))})}).then(function(){return self.clients.claim()}))}),self.addEventListener("fetch",function(e){if("GET"===e.request.method){var t,n=stripIgnoredUrlParameters(e.request.url,ignoreUrlParametersMatching);(t=urlsToCacheKeys.has(n))||(n=addDirectoryIndex(n,"index.html"),t=urlsToCacheKeys.has(n));0,t&&e.respondWith(caches.open(cacheName).then(function(e){return e.match(urlsToCacheKeys.get(n)).then(function(e){if(e)return e;throw Error("The cached response that was expected is missing.")})}).catch(function(t){return console.warn('Couldn\'t serve response for "%s" from cache: %O',e.request.url,t),fetch(e.request)}))}});