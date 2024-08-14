/* eslint-disable max-len */
import escapeHtml from '#white-room/util/escapeHtml.js';
import encodeURIComponentIfPresent from '#white-room/util/encodeURIComponentIfPresent.js';

const renderLayout = ({
  metaData = {},
  bundleStyleSrc,
  segmentKey,
  serializedState,
  bundleSrc,
  useBuild,
  devScriptBaseUrl,
  webpackDevelopmentServerPort,
  renderedReactAppHtml
}) => `
<!doctype html>
<html>

  <!-- Head -->
  <head>
    <meta charset='utf8'/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0, height=device-height, viewport-fit=cover">
    <link rel='icon' href='/favicon.ico'/>
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">

    <!-- Metatags -->
    ${metaData.pageTitle ? `<title>${escapeHtml(metaData.pageTitle)}</title>` : ''}

    <!-- Apple -->
    <meta name="apple-mobile-web-app-capable" content="yes"/>
    <meta name="apple-mobile-web-app-status-bar-style" content="black"/>

    <!-- Open Graphs -->
    ${metaData.image ? `<meta property="og:image" content="${escapeHtml(metaData.image)}" itemprop="image primaryImageOfPage"/>` : ''}
    <meta property="og:type" content="website"/>
    ${metaData.pageTitle ? `<meta property="og:title" content="${escapeHtml(metaData.pageTitle)}" name="title" itemprop="title name"/>` : ''}

    <!-- Twitter metas -->
    <meta name="twitter:domain" content="whiteroom.com"/>
    <meta name="twitter:card" content="summary"/>

    ${metaData.description ? `
      <meta name='description' content='${escapeHtml(metaData.description)}'/>
      <meta property="og:description" content="${escapeHtml(metaData.description)}" name="description" itemprop="description"/>
    ` : ''}

    ${metaData.keywords ? `<meta name='keywords' content='${escapeHtml(metaData.keywords)}'/>` : ''}

    ${metaData.canonical ? `
      <link rel='canonical' href='${encodeURIComponentIfPresent(metaData.canonical)}'/>
      <meta property="og:url" content="${encodeURIComponentIfPresent(metaData.canonical)}"/>
    ` : ''}

    ${metaData.robots ? `<meta name='robots' content='${escapeHtml(metaData.robots)}'/>` : ''}

    <!-- Bundle Stylesheets -->
    ${bundleStyleSrc ? `<link rel='stylesheet' href='${encodeURIComponentIfPresent(bundleStyleSrc)}'/>` : ''}

    <!-- Hide everything until CSS is loaded when using inlined styles -->
    ${!bundleStyleSrc ? `
      <style>
        html {
        }
      </style>
    ` : ''}

    <!-- SegmentIO script -->
    ${segmentKey ? `
      <script>
        !function(){var i="analytics",analytics=window[i]=window[i]||[];if(!analytics.initialize)if(analytics.invoked)window.console&&console.error&&console.error("Segment snippet included twice.");else{analytics.invoked=!0;analytics.methods=["trackSubmit","trackClick","trackLink","trackForm","pageview","identify","reset","group","track","ready","alias","debug","page","screen","once","off","on","addSourceMiddleware","addIntegrationMiddleware","setAnonymousId","addDestinationMiddleware","register"];analytics.factory=function(e){return function(){if(window[i].initialized)return window[i][e].apply(window[i],arguments);var n=Array.prototype.slice.call(arguments);if(["track","screen","alias","group","page","identify"].indexOf(e)>-1){var c=document.querySelector("link[rel='canonical']");n.push({__t:"bpc",c:c&&c.getAttribute("href")||void 0,p:location.pathname,u:location.href,s:location.search,t:document.title,r:document.referrer})}n.unshift(e);analytics.push(n);return analytics}};for(var n=0;n<analytics.methods.length;n++){var key=analytics.methods[n];analytics[key]=analytics.factory(key)}analytics.load=function(key,n){var t=document.createElement("script");t.type="text/javascript";t.async=!0;t.setAttribute("data-global-segment-analytics-key",i);t.src="https://cdn.segment.com/analytics.js/v1/" + key + "/analytics.min.js";var r=document.getElementsByTagName("script")[0];r.parentNode.insertBefore(t,r);analytics._loadOptions=n};analytics._writeKey="${escapeHtml(segmentKey)}";;analytics.SNIPPET_VERSION="5.2.1";
        analytics.load('${escapeHtml(segmentKey)}');
        }}();
      </script>
    ` : ''}
  </head>

  <!-- Body -->
  <body>

    <!-- Initialized Client's HTML -->
    <div id='react-container'>${renderedReactAppHtml}</div>

    <div id='scripts'>
      <!-- Serialized State -->
      ${serializedState ? `<script id='serialized-state'>window.__INITIAL_STATE__ = '${escapeHtml(serializedState)}';</script>` : ''}

      <!-- Bundle -->
      ${bundleSrc ? `<script src='${encodeURIComponentIfPresent(bundleSrc)}'></script>` : ''}

      <!-- Development scripts -->
      ${!useBuild ? `<script src='${devScriptBaseUrl}:${webpackDevelopmentServerPort || 8001}/build/bundle.js'></script>` : ''}
    </div>

  </body>
</html>
`;

export default renderLayout;
/* eslint-enable max-len */
