import browser from "webextension-polyfill";
import { ref, watch } from "vue";
import { isEqual } from "lodash-es";

export enum StorageKey {
  hostnamesWithCacheDisabled = "hostnamesWithCacheDisabled"
}

const browserStorage = {
  get: async (key: StorageKey) => {
    const storage = await browser.storage.sync.get();

    return storage[key];
  },

  set: async (key: StorageKey, value: any) => {
    await browser.storage.sync.set({ [key]: [...value] });
  }
}


export function useHostnamesWithCacheDisabled() {

  const hostnamesWithCacheDisabled = ref<string[]>([])

  watch(hostnamesWithCacheDisabled, (newValue, oldValue) => {
    if (isEqual(newValue, oldValue)) {
      return;
    }

    browserStorage.set(StorageKey.hostnamesWithCacheDisabled, newValue)
  })

  browser.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== 'sync') {
      return;
    }

    if (!(StorageKey.hostnamesWithCacheDisabled in changes)) {
      return;
    }

    hostnamesWithCacheDisabled.value = changes[StorageKey.hostnamesWithCacheDisabled].newValue
  })

  browserStorage.get(StorageKey.hostnamesWithCacheDisabled)
    .then((value) => {
      if (value == null) {
        return;
      }

      hostnamesWithCacheDisabled.value = value;
    })

  return {
    hostnamesWithCacheDisabled
  }
}