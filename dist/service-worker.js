"use strict";var precacheConfig=[["/static/common-umi.29061676.async.js","6c52b608ac145cb79e4a9f4fa50e7a1d"],["/static/src__layouts__index.98d8754a.async.js","80cc213b9c028e6947527dab50c00e82"],["/static/src__pages__404.e993b784.async.js","0a65d33336730d347d20720d48ea794a"],["/static/src__pages__access-wallet__index.c6a073d0.async.js","52efb19dab99c7ddb5d0fce54ebd4e3a"],["/static/src__pages__access-wallet__models__accessWallet.js.46ad8d82.async.js","1f41a2f10c1631b627323774682cc809"],["/static/src__pages__access-wallet__my-account__index.5b02448d.async.js","8b7ac92ba0d8258bc3289498b4f7aef1"],["/static/src__pages__create-wallet__index.1a1b35b9.async.js","f3190c3641128910fd732013e36d2784"],["/static/src__pages__create-wallet__models__createWallet.js.102ec149.async.js","1090bc4bb94c0e8a0f0edd613b62a2ed"],["/static/src__pages__index.e6e75b4a.async.js","95df9d15d3cbdcc9ac3c0fdf88106885"],["/static/static/logo.7510241f.png","7510241f561c424d2794c05679f12d28"],["/static/umi.2518fcf0.js","ea92fbe09fc3bf0bce93860ede9882cd"],["/static/umi.fb8c9854.css","fb8c9854f8f2a56a949e015bafc10c7a"]],cacheName="sw-precache-v3-sw-precache-webpack-plugin-"+(self.registration?self.registration.scope:""),ignoreUrlParametersMatching=[/^utm_/],addDirectoryIndex=function(e,t){var n=new URL(e);return"/"===n.pathname.slice(-1)&&(n.pathname+=t),n.toString()},cleanResponse=function(e){return e.redirected?("body"in e?Promise.resolve(e.body):e.blob()).then(function(t){return new Response(t,{headers:e.headers,status:e.status,statusText:e.statusText})}):Promise.resolve(e)},createCacheKey=function(e,t,n,a){var c=new URL(e);return a&&c.pathname.match(a)||(c.search+=(c.search?"&":"")+encodeURIComponent(t)+"="+encodeURIComponent(n)),c.toString()},isPathWhitelisted=function(e,t){if(0===e.length)return!0;var n=new URL(t).pathname;return e.some(function(e){return n.match(e)})},stripIgnoredUrlParameters=function(e,t){var n=new URL(e);return n.hash="",n.search=n.search.slice(1).split("&").map(function(e){return e.split("=")}).filter(function(e){return t.every(function(t){return!t.test(e[0])})}).map(function(e){return e.join("=")}).join("&"),n.toString()},hashParamName="_sw-precache",urlsToCacheKeys=new Map(precacheConfig.map(function(e){var t=e[0],n=e[1],a=new URL(t,self.location),c=createCacheKey(a,hashParamName,n,!1);return[a.toString(),c]}));function setOfCachedUrls(e){return e.keys().then(function(e){return e.map(function(e){return e.url})}).then(function(e){return new Set(e)})}self.addEventListener("install",function(e){e.waitUntil(caches.open(cacheName).then(function(e){return setOfCachedUrls(e).then(function(t){return Promise.all(Array.from(urlsToCacheKeys.values()).map(function(n){if(!t.has(n)){var a=new Request(n,{credentials:"same-origin"});return fetch(a).then(function(t){if(!t.ok)throw new Error("Request for "+n+" returned a response with status "+t.status);return cleanResponse(t).then(function(t){return e.put(n,t)})})}}))})}).then(function(){return self.skipWaiting()}))}),self.addEventListener("activate",function(e){var t=new Set(urlsToCacheKeys.values());e.waitUntil(caches.open(cacheName).then(function(e){return e.keys().then(function(n){return Promise.all(n.map(function(n){if(!t.has(n.url))return e.delete(n)}))})}).then(function(){return self.clients.claim()}))}),self.addEventListener("fetch",function(e){if("GET"===e.request.method){var t,n=stripIgnoredUrlParameters(e.request.url,ignoreUrlParametersMatching);(t=urlsToCacheKeys.has(n))||(n=addDirectoryIndex(n,"index.html"),t=urlsToCacheKeys.has(n));0,t&&e.respondWith(caches.open(cacheName).then(function(e){return e.match(urlsToCacheKeys.get(n)).then(function(e){if(e)return e;throw Error("The cached response that was expected is missing.")})}).catch(function(t){return console.warn('Couldn\'t serve response for "%s" from cache: %O',e.request.url,t),fetch(e.request)}))}});