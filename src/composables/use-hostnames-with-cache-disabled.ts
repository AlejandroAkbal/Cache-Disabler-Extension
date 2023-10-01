import { isEqual } from 'lodash-es'
import { ref, toRaw, watch } from 'vue'

import { Storage } from '@plasmohq/storage'





export enum StorageKey {
  hostnamesWithCacheDisabled = 'hostnamesWithCacheDisabled'
}

const storage = new Storage()

export function useHostnamesWithCacheDisabled() {
  const hostnamesWithCacheDisabled = ref<string[]>([])

  // Save the value to storage when it changes
  watch(hostnamesWithCacheDisabled, async (newValue, oldValue) => {
    newValue = toRaw(newValue)
    oldValue = toRaw(oldValue)

    if (isEqual(newValue, oldValue)) {
      return
    }

    // TODO: Skip until initial value is set

    await storage.set(StorageKey.hostnamesWithCacheDisabled, newValue)

    console.debug('watch: hostnamesWithCacheDisabled changed', { newValue, oldValue })
  })

  // Watch for changes to the storage
  storage.watch({
    [StorageKey.hostnamesWithCacheDisabled]: (changes) => {
      hostnamesWithCacheDisabled.value = changes.newValue
    }
  })

  // Load the initial value from storage
  storage.get(StorageKey.hostnamesWithCacheDisabled).then((value) => {
    if (value == null) {
      return
    }

    hostnamesWithCacheDisabled.value = value

    console.debug('Loaded hostnamesWithCacheDisabled from storage', value)
  })

  return {
    hostnamesWithCacheDisabled
  }
}