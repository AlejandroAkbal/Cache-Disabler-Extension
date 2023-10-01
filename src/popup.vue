<script lang="ts" setup>
  import { computed, ComputedRef, onBeforeMount, Ref, ref } from 'vue'

  import '~style.css'

  import { useHostnamesWithCacheDisabled } from './composables/use-hostnames-with-cache-disabled'

  const { hostnamesWithCacheDisabled } = useHostnamesWithCacheDisabled()

  const browserTab: Ref<chrome.tabs.Tab | undefined> = ref(undefined)

  onBeforeMount(async () => {
    const [tab] = await chrome.tabs.query({
      active: true,
      lastFocusedWindow: true
    })

    browserTab.value = tab
  })

  const currentSite: ComputedRef<URL | null> = computed(() => {
    if (!browserTab.value) {
      return null
    }

    if (!browserTab.value.url.startsWith('http')) {
      return null
    }

    return new URL(browserTab.value.url)
  })

  const isCurrentSiteDisabled: ComputedRef<boolean> = computed(() => {
    if (currentSite.value === null) {
      return false
    }

    return hostnamesWithCacheDisabled.value.includes(currentSite.value.hostname)
  })

  function toggleCache() {
    if (currentSite.value == null) {
      alert(`This extension only works on websites, "${browserTab.value.url}" is not a website`)
      return
    }

    const currentSiteHostname = currentSite.value.hostname

    // Remove hostname
    if (isCurrentSiteDisabled.value) {
      hostnamesWithCacheDisabled.value = hostnamesWithCacheDisabled.value.filter(
        (hostname) => hostname !== currentSiteHostname
      )

      // Add hostname
    } else {
      hostnamesWithCacheDisabled.value = [...hostnamesWithCacheDisabled.value, currentSiteHostname]
    }
  }
</script>

<template>
  <div class="container relative flex h-full flex-col gap-12 p-4">
    <!-- Background -->
    <div class="absolute inset-0 -z-10 h-full w-full overflow-hidden">
      <svg
        style="transform: translate(50%, 35%) scale(1.8)"
        viewBox="0 0 500 1000"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <!-- Blur -->
          <filter
            id="b"
            filterUnits="userSpaceOnUse"
            height="2000"
            width="1000"
            x="-250"
            y="-500"
          >
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation="30"
            />
          </filter>

          <!-- Gradient -->
          <radialGradient
            id="c"
            cx="50%"
            cy="50%"
            fx="70%"
            fy="39%"
            r="50%"
          >
            <!-- Tailwind's indigo[600] -->
            <stop
              offset="0%"
              stop-color="#4f46e5"
            />
            <!-- Tailwind's fuchsia[500] -->
            <stop
              offset="100%"
              stop-color="rgba(194,68,247,0.2)"
            />
          </radialGradient>
        </defs>

        <g filter="url(#b)">
          <svg
            transform="translate(-56.586 -303.166)"
            viewBox="0 0 500 500"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M401.5 327.5Q340 405 233.5 434t-141-77.5Q58 250 115.5 183t138-73q80.5-6 145 67t3 150.5Z"
              fill="url(#c)"
            />
          </svg>
        </g>
      </svg>
    </div>

    <!-- Body -->
    <main class="flex flex-auto flex-col gap-6">
      <!-- Header -->
      <header class="text-center">
        <h1 class="text-lg font-semibold leading-8 text-base-content-highlight">Cache Disabler</h1>
        <p class="text-sm leading-5">Ensure you get the latest changes during 🕸 development</p>
      </header>

      <section class="my-8">
        <!-- Form -->
        <form class="flex">
          <input
            id="toggleCacheOfCurrentWebsite"
            :checked="isCurrentSiteDisabled"
            class="peer hidden"
            type="checkbox"
            @click="toggleCache"
          />

          <label
            class="focus-visible:focus-outline-util w-full cursor-pointer select-none rounded-lg border border-primary-300 bg-primary-200 px-2 py-4 text-center text-sm font-semibold text-primary-800/70 shadow shadow-primary-200 hover:bg-primary-300 peer-checked:border-primary-200 peer-checked:bg-primary-100 peer-checked:hover:bg-primary-200"
            for="toggleCacheOfCurrentWebsite"
            tabindex="0"
            @keyup.space="toggleCache"
            @keyup.enter="toggleCache"
          >
            {{ isCurrentSiteDisabled ? 'Enable' : 'Disable' }}
            cache for this hostname
          </label>
        </form>

        <!-- TODO: Add notice about reloading website if its the first time -->
      </section>

      <!-- List of hostnames with cache disabled -->
      <section
        v-if="hostnamesWithCacheDisabled.length"
        class="flex-auto"
      >
        <p class="flex items-center gap-1 text-sm font-medium">
          <span class="rounded-full bg-base-200 px-2 py-0.5 text-xs tabular-nums text-base-content-highlight">
            {{ hostnamesWithCacheDisabled.length }}
          </span>
          hostnames with cache disabled
        </p>

        <ul class="mt-2 list-none">
          <li
            v-for="hostname in hostnamesWithCacheDisabled"
            :key="hostname"
          >
            {{ hostname }}

            <!-- TODO: Delete button -->
          </li>
        </ul>
      </section>
    </main>

    <footer class="flex-none text-center text-xs font-medium text-base-content">
      Made with <span class="text-base">⌨</span> by
      <a
        class="hover:hover-text-util focus-visible:focus-outline-util text-base-content-highlight underline"
        href="https://akbal.dev"
        target="_blank"
      >
        Alejandro Akbal
      </a>
    </footer>
  </div>
</template>