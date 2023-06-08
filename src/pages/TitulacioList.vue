<template>
  <q-page class="flex column" padding>
    <div>
      <q-btn-group push class="q-mb-lg q-mr-lg">
        <q-btn  color="primary" label="Nova titulació" icon="add" :to="'/titulacio'" v-if="rolsUser.find(rol=>rol===rols.ADMINISTRADOR || rol===rols.DIRECTOR || rol===rols.CAP_ESTUDIS)"/>
      </q-btn-group>
      <q-toggle
        v-model="displayAllTitulacions"
        label="Veure totes les titulacions? (sinó, només es veuen les de nivell superior)"
        @update:model-value="refreshTitulacions"
      />
    </div>

    <q-table
      title="Titulacions"
      :rows="titulacions"
      :columns="columnes"
      row-key="id"
      :filter="filter"
      v-model:selected="selected"
    >
      <template v-slot:top-right>
        <q-input borderless dense debounce="300" v-model="filter" placeholder="Cerca">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </template>
      <template v-slot:body-cell-accions="props">
        <q-td :props="props">
          <div>
            <q-btn-group push>
              <q-btn icon="edit" color="primary" :to="'/titulacio/'+props.value">
                <q-tooltip>
                  Edita
                </q-tooltip>
              </q-btn>
              <q-btn icon="delete" color="primary" @click="esborrarTitulacio(props.value)">
                <q-tooltip>
                  Esborra
                </q-tooltip>
              </q-btn>
            </q-btn-group>
          </div>
        </q-td>
      </template>
    </q-table>

  </q-page>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import {ConvalidacioService} from 'src/service/ConvalidacioService';
import {QTableColumn} from "quasar";
import {ItemConvalidacio} from "src/model/ItemConvalidacio";
import {Rol} from "src/model/Rol";


export default defineComponent({
  name: 'PageGrupCorreu',
  data() {
    return {
      titulacions: [] as ItemConvalidacio[],
      columnes: [] as QTableColumn[],
      selected: [],
      filter: '',
      rolsUser: JSON.parse(localStorage.getItem("rol")??"") || [],
      rols: Rol,
      displayAllTitulacions: false
    }
  },
  created() {
    this.get();
  },
  methods: {
    get: async function () {
      this.columnes = [
        {
          name: 'codi',
          required: true,
          label: 'Codi',
          align: 'left',
          field: row => row.codi,
          sortable: true
        },
        {
          name: 'nom',
          required: true,
          label: 'Nom',
          align: 'left',
          field: row => row.nom,
          sortable: true
        },
        {
          name: 'categoria',
          required: true,
          label: 'Categoria',
          align: 'left',
          field: row => row.categoria.nom,
          sortable: true
        },
        {
          name: 'accions',
          required: true,
          label: 'Accions',
          align: 'center',
          field: row => row.id,
          sortable: true
        }
      ]

      const titulacions:Array<ItemConvalidacio>= await ConvalidacioService.getTitulacions();

      this.titulacions = titulacions;
    },
    esborrarTitulacio(id:number){
      this.$q.dialog({
        title: 'Confirm',
        message: 'Vol eliminar aquesta titulació?',
        ok: "D'acord",
        cancel: "Cancel·la",
        persistent: true
      }).onOk(async () => {
        console.log('>>>> OK',id)
        await ConvalidacioService.esborrarTitulacio(id);
        //Refresh data
        setTimeout(function(){
          window.location.reload();
        },1000);
      })
    },
    async refreshTitulacions(){
      if(this.displayAllTitulacions){
        this.titulacions = await ConvalidacioService.getTitulacions(false,true);
      } else {
        this.titulacions = await ConvalidacioService.getTitulacions();
      }
    }
  }
})
</script>
