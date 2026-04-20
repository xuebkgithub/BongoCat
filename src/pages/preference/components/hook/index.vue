<script setup lang="ts">
import { Input, Segmented } from 'ant-design-vue'

import ProListItem from '@/components/pro-list-item/index.vue'
import ProList from '@/components/pro-list/index.vue'
import { LABEL_SIZES, useLabelStore } from '@/stores/label'

const labelStore = useLabelStore()
</script>

<template>
  <ProList :title="$t('pages.preference.hook.labels.labelSettings')">
    <ProListItem
      :description="$t('pages.preference.hook.hints.labelText')"
      :title="$t('pages.preference.hook.labels.labelText')"
      vertical
    >
      <Input
        v-model:value="labelStore.text"
        :maxlength="24"
        :placeholder="$t('pages.preference.hook.hints.labelTextPlaceholder')"
      />
    </ProListItem>

    <ProListItem
      :description="$t('pages.preference.hook.hints.labelSize')"
      :title="$t('pages.preference.hook.labels.labelSize')"
      vertical
    >
      <Segmented
        v-model:value="labelStore.size"
        block
        :options="LABEL_SIZES.map(value => ({
          label: $t(`pages.preference.hook.options.${value}`),
          value,
        }))"
      />
    </ProListItem>
  </ProList>
</template>
