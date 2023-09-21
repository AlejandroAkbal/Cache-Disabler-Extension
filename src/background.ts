export {}

async function clearCache(): Promise<chrome.webRequest.BlockingResponse> {
  if (typeof chrome.browsingData === "undefined") {
    throw new Error("Your browser does not support cache cleaning")
  }

  await chrome.browsingData.removeCache({})

  return {}
}

chrome.webRequest.onBeforeRequest.addListener(clearCache, {
  urls: ["<all_urls>"]
})

console.log("Cache cleaner is running")
