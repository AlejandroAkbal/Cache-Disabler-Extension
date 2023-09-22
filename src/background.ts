import browser from "webextension-polyfill";
import { StorageKey, useHostnamesWithCacheDisabled } from "~composables/use-hostnames-with-cache-disabled";




(async () => {
  // await browser.storage.sync.clear();

  const { hostnamesWithCacheDisabled } = useHostnamesWithCacheDisabled()

  hostnamesWithCacheDisabled.value = ["localhost"]

  // TODO: On installed, set the default value for hostnamesWithCacheDisabled to []

  /**
   * This script is executed for each request made by the browser.
   */
  async function clearCache(details: browser.WebRequest.OnBeforeRequestDetailsType) {
    // Skip requests that are not HTTP, like chrome-extension://
    if (!details.url.startsWith("http")) {
      return {}
    }

    const initiatorHostname = new URL(details.initiator).hostname

    // Skip if the initiator is NOT in the list of hostnames with cache disabled
    if (!hostnamesWithCacheDisabled.value.includes(initiatorHostname)) {
      console.debug(
        "Skipping",
        details.url,
        "because",
        initiatorHostname,
        "is not in the list of hostnames with cache disabled"
      )
      return {}
    }

    await browser.browsingData.removeCache({})

    console.info("Removed cache for", details.url)

    return {}
  }

  function main() {
    console.log("Cache cleaner extension is running")

    browser.webRequest.onBeforeRequest.addListener(clearCache, {
      urls: ["<all_urls>"]
    })
  }

  main()
})()