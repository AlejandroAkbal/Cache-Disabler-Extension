import { useHostnamesWithCacheDisabled } from '~composables/use-hostnames-with-cache-disabled'





(async () => {
  const { hostnamesWithCacheDisabled } = useHostnamesWithCacheDisabled()

  /**
   * This script is executed for each request made by the browser.
   */
  async function clearCache(details: chrome.webRequest.WebRequestBodyDetails) {
    // Skip requests that are not HTTP, like chrome-extension://
    if (!details.url.startsWith('http')) {
      return
    }

    const initiatorHostname = new URL(details.initiator).hostname

    // Skip if the initiator is NOT in the list of hostnames with cache disabled
    if (!hostnamesWithCacheDisabled.value.includes(initiatorHostname)) {
      console.debug(
        'Skipping',
        details.url,
        'because',
        initiatorHostname,
        'is not in the list of hostnames with cache disabled'
      )
      return
    }

    await chrome.browsingData.remove(
      {
        origins: [details.initiator]
      },
      {
        appcache: true,
        cache: true,
        cacheStorage: true
      }
    )

    console.info('Removed cache for', details.url)

    return
  }

  function main() {
    console.log('Cache cleaner extension is running')

    chrome.webRequest.onBeforeRequest.addListener(clearCache, {
      urls: ['<all_urls>']
    })
  }

  main()
})()