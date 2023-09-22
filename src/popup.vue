<script lang="ts" setup>
import { computed, ComputedRef, onBeforeMount, Ref, ref } from "vue"
import browser from "webextension-polyfill"

import "~style.css"

import { useHostnamesWithCacheDisabled } from "./composables/use-hostnames-with-cache-disabled"

const { hostnamesWithCacheDisabled } = useHostnamesWithCacheDisabled()

const browserTabs: Ref<chrome.tabs.Tab[] | null> = ref(null)

onBeforeMount(async () => {
  const tabs = await browser.tabs.query({
    active: true,
    currentWindow: true
  })

  browserTabs.value = tabs
})

const currentSite: ComputedRef<URL | null> = computed(() => {
  if (!browserTabs.value?.length || !browserTabs.value[0]) {
    return null
  }

  return new URL(browserTabs.value[0].url)
})

const isCurrentSiteDisabled: ComputedRef<boolean> = computed(() => {
  if (currentSite.value === null) {
    return false
  }

  return hostnamesWithCacheDisabled.value.includes(currentSite.value.hostname)
})

function toggleCache() {
  if (currentSite.value == null) {
    return
  }

  const currentSiteHostname = currentSite.value.hostname
  const currentSiteUrl = currentSite.value.toString()

  if (!currentSiteUrl.startsWith("http")) {
    alert('This extension only works with HTTP and HTTPS websites, "' + currentSiteUrl + '" is not valid')
    return
  }

  if (isCurrentSiteDisabled.value) {
    hostnamesWithCacheDisabled.value = hostnamesWithCacheDisabled.value.filter(
      (hostname) => hostname !== currentSiteHostname
    )
  } else {
    hostnamesWithCacheDisabled.value = [...hostnamesWithCacheDisabled.value, currentSiteHostname]
  }
}
</script>

<template>
  <!-- TODO: Beautiful background with blurry SVGs -->
  <div class="container min-w-[300px] min-h-[400px] p-4 flex flex-col">
    <main class="flex-auto flex flex-col gap-6">
      <!-- Header -->
      <div class="text-center">
        <h1 class="text-base font-semibold leading-7 text-base-content-highlight">Cache Disabler</h1>
        <p class="text-sm leading-6 text-base-content">
          Disable the browser cache for any website. Perfect for developing websites.
        </p>
      </div>

      <!-- Form -->
      <form class="block">
        <label for="toggleCacheOfCurrentWebsite"> Disable cache for this tab </label>
        <input
          id="toggleCacheOfCurrentWebsite"
          :checked="isCurrentSiteDisabled"
          type="checkbox"
          @click.prevent="toggleCache" />
      </form>

      <!-- List of hostnames with cache disabled -->
      <div class="flex-auto overflow-y-auto">
        <p class="text-sm leading-6 text-base-content">
          There are {{ hostnamesWithCacheDisabled.length }} hostnames with cache disabled
        </p>

        <ul class="list-none">
          <li v-for="hostname in hostnamesWithCacheDisabled" :key="hostname">
            {{ hostname }}
          </li>
        </ul>
      </div>
    </main>

    <footer class="flex-none text-xs text-base-content text-center">
      Made with love by
      <a class="hover:hover-text-util underline" href="https://akbal.dev">Alejandro Akbal</a>
    </footer>
  </div>
</template>
