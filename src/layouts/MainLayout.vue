<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title>
          GestSuite - Convalidacions
        </q-toolbar-title>

        <Menuapp v-if="enableApps && (rolsUser.find(rol=>rol===rols.ADMINISTRADOR || rol===rols.DIRECTOR || rol===rols.CAP_ESTUDIS || rol===rols.ADMINISTRATIU || rol===rols.WEB))"></Menuapp>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
    >
      <q-list>
        <q-item clickable to="/solicituds">
          <q-item-section avatar>
            <q-icon name="description" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Sol·licituds</q-item-label>
          </q-item-section>
        </q-item>
        <q-item clickable to="/convalidacions">
          <q-item-section avatar>
            <q-icon name="hub" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Convalidacions</q-item-label>
          </q-item-section>
        </q-item>
        <q-item clickable to="/titulacions">
          <q-item-section avatar>
            <q-icon name="grade" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Titulacions</q-item-label>
          </q-item-section>
        </q-item>
        <q-item clickable to="/categories">
          <q-item-section avatar>
            <q-icon name="category" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Categories</q-item-label>
          </q-item-section>
        </q-item>
        <q-item clickable to="/logout">
          <q-item-section avatar>
            <q-icon name="logout" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Sortir</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>


<script>

import { defineComponent,defineAsyncComponent,ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {Rol} from '../model/Rol.ts'
import Menuapp from '../components/common/AppsMenu';

export default defineComponent({
  name: 'MainLayout',
  components:{
    Menuapp
  },
  setup () {
    const leftDrawerOpen = ref(false)
    const rolsUser = JSON.parse(localStorage.getItem("rol")) || []; //Inicialitzem a un array buit si no existeix cap rol
    const router = useRouter()
    const route = useRoute()
    const rols = Rol;

    const enableGrupsCooperatius = (process.env.APP_ENABLE_GRUPSCOOPERATIUS==='true');
    const enableConvalidacions=(process.env.APP_ENABLE_CONVALIDACIONS==='true');
    const enableProfessoratManager=(process.env.APP_ENABLE_PROFESSORATMANAGER==='true');

    const enableApps = enableGrupsCooperatius || enableConvalidacions || enableProfessoratManager;

    return {
      rolsUser,
      rols,
      enableApps,
      leftDrawerOpen,
      toggleLeftDrawer () {
        leftDrawerOpen.value = !leftDrawerOpen.value
      },
      goBack(){
        router.go(-1);
      }
    }
  }
})
</script>
