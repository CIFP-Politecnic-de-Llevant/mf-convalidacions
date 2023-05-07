<template>
  <q-btn color="grey" label="Apps">
    <q-menu>
      <q-list style="min-width: 100px">
        <q-item v-if="appUsuarisEnabled" clickable v-close-popup :href="appUsuarisURL">
          <q-item-section>Usuaris</q-item-section>
        </q-item>
        <q-item v-if="appConvalidacionsEnabled" clickable v-close-popup :href="appConvalidacionsURL">
          <q-item-section>Convalidacions</q-item-section>
        </q-item>
        <q-item v-if="appWebIesManacorEnabled" clickable v-close-popup :href="appWebIesManacorURL">
          <q-item-section>Web</q-item-section>
        </q-item>
      </q-list>
    </q-menu>
  </q-btn>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'ExampleComponent',

  data(){
    return {
      appUsuarisEnabled: process.env.APP_ENABLE_USUARIS,
      appUsuarisURL: process.env.APP_URL_USUARIS,
      appConvalidacionsEnabled: process.env.APP_ENABLE_CONVALIDACIONS,
      appConvalidacionsURL: process.env.APP_URL_CONVALIDACIONS,
      appWebIesManacorEnabled: process.env.APP_ENABLE_WEBIESMANACOR,
      appWebIesManacorURL: process.env.APP_URL_WEBIESMANACOR
    }
  },
  methods: {

  }
});
</script>
