<template>
  <q-page class="column no-wrap" padding>
    <div>
      <q-btn-group push class="q-mb-lg q-mr-lg">
        <q-btn color="primary" label="Nova sol·licitud" icon="add" :to="'/solicitud'"/>
      </q-btn-group>
    </div>

    <q-tabs
      v-model="tab"
      dense
      class="text-grey"
      active-color="primary"
      indicator-color="primary"
      align="justify"
      narrow-indicator
    >
      <q-tab name="pendent_resolucio" label="Pendent de resolució"/>
      <q-tab name="standby" label="En Espera"/>
      <q-tab name="pendent_signatura" label="Pendent de signatura"/>
      <q-tab name="resolts" label="Resolts"/>
      <q-tab name="cancelats" label="Cancel·lats"/>
    </q-tabs>

    <q-separator/>

    <q-tab-panels v-model="tab" animated>
      <q-tab-panel name="pendent_resolucio">
        <q-table
          title="Sol·licituds pendents de resolució"
          :rows="solicitudsPendentResolucio"
          :columns="columnesPendentResolucio"
          :filter="filterPendentResolucio"
          wrap-cells
        >
          <template v-slot:top-right>
            <q-input borderless dense debounce="300" v-model="filterPendentResolucio" placeholder="Cerca">
              <template v-slot:append>
                <q-icon name="search"/>
              </template>
            </q-input>
          </template>
          <template v-slot:body-cell-accions="props">
            <q-td :props="props">
              <div>
                <q-btn-group push>
                  <q-btn icon="edit" color="primary" :to="'/solicitud/'+props.value">
                    <q-tooltip>
                      Edita
                    </q-tooltip>
                  </q-btn>
                  <q-btn icon="change_circle" color="primary" @click="changeEstat(props.value,'standby')">
                    <q-tooltip>
                      Canvia l'estat a Espera
                    </q-tooltip>
                  </q-btn>
                  <q-btn icon="delete" color="primary" @click="esborrarSolicitud(props.value)">
                    <q-tooltip>
                      Esborra
                    </q-tooltip>
                  </q-btn>
                </q-btn-group>
              </div>
            </q-td>
          </template>
        </q-table>
      </q-tab-panel>
      <q-tab-panel name="standby">
        <q-table
          title="Sol·licituds en espera"
          :rows="solicitudsStandBy"
          :columns="columnesStandBy"
          :filter="filterStandBy"
          wrap-cells
        >
          <template v-slot:top-right>
            <q-input borderless dense debounce="300" v-model="filterStandBy" placeholder="Cerca">
              <template v-slot:append>
                <q-icon name="search"/>
              </template>
            </q-input>
          </template>
          <template v-slot:body-cell-accions="props">
            <q-td :props="props">
              <div>
                <q-btn-group push>
                  <q-btn icon="change_circle" color="primary" @click="changeEstat(props.value,'pendent')">
                    <q-tooltip>
                      Canvia l'estat a Pendent
                    </q-tooltip>
                  </q-btn>
                  <q-btn icon="delete" color="primary" @click="esborrarSolicitud(props.value)">
                    <q-tooltip>
                      Esborra
                    </q-tooltip>
                  </q-btn>
                </q-btn-group>
              </div>
            </q-td>
          </template>
        </q-table>
      </q-tab-panel>
      <q-tab-panel name="pendent_signatura">
        <q-btn class="q-ma-md" label="Signar resolucions" color="primary" :loading="signant" :disable="signant" @click="confirmSignatura = true"/>
        <q-table
          title="Sol·licituds pendent de signatura"
          :rows="solicitudsPendentSignatura"
          :columns="columnesPendentSignatura"
          :filter="filterPendentSignatura"
          row-key="id"
          selection="multiple"
          v-model:selected="selectedPendentSignatura"
          wrap-cells
        >
          <template v-slot:top-right>
            <q-input borderless dense debounce="300" v-model="filterPendentSignatura" placeholder="Cerca">
              <template v-slot:append>
                <q-icon name="search"/>
              </template>
            </q-input>
          </template>
          <template v-slot:body-cell-accions="props">
            <q-td :props="props">
              <div>
                <q-btn-group push>
                  <q-btn icon="edit" color="primary" :to="'/solicitud/'+props.value">
                    <q-tooltip>
                      Edita
                    </q-tooltip>
                  </q-btn>
                  <q-btn icon="delete" color="primary" @click="esborrarSolicitud(props.value)">
                    <q-tooltip>
                      Esborra
                    </q-tooltip>
                  </q-btn>
                </q-btn-group>
              </div>
            </q-td>
          </template>
        </q-table>
      </q-tab-panel>
      <q-tab-panel name="resolts">
        <div class="row items-center q-gutter-sm q-mb-md">
          <q-btn
            color="primary"
            icon-right="archive"
            label="Exportar dades a csv"
            no-caps
            @click="exportTable"
          />
          <q-btn label="Tornar a signar resolucions" color="primary" :loading="signant" :disable="signant || selectedResoltes.length===0" @click="confirmResignatura = true"/>
          <span v-if="selectedResoltes.length>0" class="text-grey-8">{{ selectedResoltes.length }} seleccionades</span>
        </div>
        <q-table
          title="Sol·licituds resoltes"
          :rows="solicitudsResoltesFiltrades"
          :columns="columnesResoltes"
          row-key="id"
          selection="multiple"
          v-model:selected="selectedResoltes"
          v-model:pagination="paginacioResoltes"
          :rows-per-page-options="[10,25,50,100,0]"
          rows-per-page-label="Files per pàgina"
          wrap-cells
          dense
          flat
          bordered
        >
          <template v-slot:top>
            <div class="row items-end q-gutter-sm full-width">
              <div class="text-h6 q-mr-md">Sol·licituds resoltes</div>
              <q-input dense outlined stack-label clearable type="date" v-model="filtreSignaturaDes" label="Signades des de" style="width: 175px"/>
              <q-input dense outlined stack-label clearable type="date" v-model="filtreSignaturaFins" label="Signades fins a" style="width: 175px"/>
              <q-btn flat dense no-caps color="primary" icon="event" label="Aquest curs" @click="filtraCursActual">
                <q-tooltip>Des de l'1 de setembre del curs actual fins avui</q-tooltip>
              </q-btn>
              <q-space/>
              <q-input dense outlined debounce="300" v-model="filterResoltes" placeholder="Cerca" style="min-width: 200px">
                <template v-slot:append>
                  <q-icon name="search"/>
                </template>
              </q-input>
            </div>
            <div class="row items-center q-gutter-sm full-width q-mt-sm">
              <span class="text-grey-8">{{ nombreResoltesVisibles }} de {{ solicitudsResoltes.length }} sol·licituds</span>
              <q-btn flat dense no-caps color="primary" icon="done_all" :label="'Seleccionar les ' + nombreResoltesVisibles + ' filtrades'" :disable="nombreResoltesVisibles===0" @click="seleccionaResoltesFiltrades"/>
              <q-btn v-if="selectedResoltes.length>0" flat dense no-caps color="grey-8" icon="clear" label="Treure la selecció" @click="selectedResoltes = []"/>
            </div>
          </template>
          <template v-slot:body-cell-accions="props">
            <q-td :props="props">
              <q-btn-group push>
                <q-btn dense icon="visibility" color="primary" :to="'/solicitud-resolta/'+props.value">
                  <q-tooltip>
                    Veure sol·licitud
                  </q-tooltip>
                </q-btn>
                <q-btn dense icon="description" color="primary" @click="downloadResolucio(props.value)" target="_blank">
                  <q-tooltip>
                    Document signat
                  </q-tooltip>
                </q-btn>
              </q-btn-group>
            </q-td>
          </template>
        </q-table>
      </q-tab-panel>
      <q-tab-panel name="cancelats">
        <q-table
          title="Sol·licituds"
          :rows="solicitudsCancelades"
          :columns="columnesCancelades"
          :filter="filterCancelades"
          wrap-cells
        >
          <template v-slot:top-right>
            <q-input borderless dense debounce="300" v-model="filterCancelades" placeholder="Cerca">
              <template v-slot:append>
                <q-icon name="search"/>
              </template>
            </q-input>
          </template>
          <template v-slot:body-cell-accions="props">
            <q-td :props="props">
              <div>
                <q-btn-group push>
                  <q-btn icon="edit" color="primary" :to="'/solicitud/'+props.value">
                    <q-tooltip>
                      Edita
                    </q-tooltip>
                  </q-btn>
                  <q-btn icon="delete" color="primary" @click="esborrarSolicitud(props.value)">
                    <q-tooltip>
                      Esborra
                    </q-tooltip>
                  </q-btn>
                </q-btn-group>
              </div>
            </q-td>
          </template>
        </q-table>
      </q-tab-panel>
    </q-tab-panels>

    <q-dialog v-model="confirmSignatura" persistent>
      <q-card>
        <q-card-section class="flex column">
          <div class="row items-center">
            <q-avatar icon="fingerprint" color="primary" text-color="white"/>
            <span class="q-ml-sm">Està segur que vol signar {{ selectedPendentSignatura.length }} resolucions?</span>
          </div>
            <q-file v-model="fileSignature" label="Fitxer signatura" />
            <q-input v-model="passwordSignature" type="password" placeholder="Contrasenya signatura" hint="La contrasenya NO es desa en cap cas."/>
            <span class="q-ml-sm">Aquesta acció no es pot desfer.</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel·la" color="primary" v-close-popup/>
          <q-btn label="Signar" color="primary" :disable="signant" @click="signaSolicituds" v-close-popup/>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="confirmResignatura" persistent>
      <q-card>
        <q-card-section class="flex column">
          <div class="row items-center">
            <q-avatar icon="fingerprint" color="primary" text-color="white"/>
            <span class="q-ml-sm">Està segur que vol tornar a signar {{ selectedResoltes.length }} resolucions?</span>
          </div>
            <q-file v-model="fileSignature" label="Fitxer signatura" />
            <q-input v-model="passwordSignature" type="password" placeholder="Contrasenya signatura" hint="La contrasenya NO es desa en cap cas."/>
            <q-toggle v-model="resignaturaCorreccio" label="El correu indica que és una resolució corregida"/>
            <q-toggle v-model="resignaturaNotificarTutors" label="Enviar còpia als tutors (si no, només a l'alumne)"/>
            <span class="q-ml-sm">Es generarà una resolució nova amb la data d'avui i se n'enviarà el correu. Aquesta acció no es pot desfer.</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel·la" color="primary" v-close-popup/>
          <q-btn label="Tornar a signar" color="primary" :disable="signant" @click="resignaSolicituds" v-close-popup/>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script lang="ts">
import {defineComponent, ref} from 'vue';
import {ConvalidacioService} from 'src/service/ConvalidacioService';
import {QTableColumn,exportFile, useQuasar } from "quasar";
import {EstatSolicitudConvalidacio, SolicitudConvalidacio} from "src/model/SolicitudConvalidacio";
import {PDFService} from "src/service/PDFService";
import {UsuariService} from "src/service/UsuariService";
import {FitxerBucket} from "src/model/google/FitxerBucket";


export default defineComponent({
  name: 'SolicitudList',
  data() {
    return {
      solicitudsPendentResolucio: [] as SolicitudConvalidacio[],
      solicitudsStandBy: [] as SolicitudConvalidacio[],
      solicitudsPendentSignatura: [] as SolicitudConvalidacio[],
      solicitudsResoltes: [] as SolicitudConvalidacio[],
      solicitudsCancelades: [] as SolicitudConvalidacio[],
      columnesPendentSignatura: [] as QTableColumn[],
      columnesPendentResolucio: [] as QTableColumn[],
      columnesResoltes: [] as QTableColumn[],
      columnesCancelades: [] as QTableColumn[],
      columnesStandBy: [] as QTableColumn[],
      selectedPendentSignatura: [],
      selectedResoltes: [] as SolicitudConvalidacio[],
      filterPendentResolucio: '',
      filterStandBy: '',
      filterPendentSignatura: '',
      filterResoltes: '',
      filterCancelades: '',
      filtreSignaturaDes: '',
      filtreSignaturaFins: '',
      paginacioResoltes: {sortBy: 'datasignatura', descending: true, page: 1, rowsPerPage: 25},
      tab: ref('pendent_resolucio'),
      confirmSignatura: false,
      confirmResignatura: false,
      resignaturaCorreccio: true,
      resignaturaNotificarTutors: false,
      signant: false,
      fileSignature: null,
      passwordSignature: ''
    }
  },
  computed: {
    solicitudsResoltesFiltrades(): SolicitudConvalidacio[] {
      const des = this.filtreSignaturaDes ? new Date(this.filtreSignaturaDes + 'T00:00:00') : null;
      const fins = this.filtreSignaturaFins ? new Date(this.filtreSignaturaFins + 'T23:59:59.999') : null;
      const cerca = (this.filterResoltes || '').toLowerCase();

      return this.solicitudsResoltes.filter(s => {
        if (des || fins) {
          if (!s.dataSignatura) {
            return false;
          }
          const dataSignatura = new Date(s.dataSignatura);
          if ((des && dataSignatura < des) || (fins && dataSignatura > fins)) {
            return false;
          }
        }
        if (cerca) {
          //Mateixa cerca que fa la q-table: el text a qualsevol columna
          return this.columnesResoltes.filter(col => col.name !== 'accions').some(col => {
            const valor = typeof col.field === 'function' ? col.field(s) : (s as any)[col.field];
            const text = col.format ? col.format(valor, s) : valor;
            return String(text ?? '').toLowerCase().includes(cerca);
          });
        }
        return true;
      });
    },
    nombreResoltesVisibles(): number {
      return this.solicitudsResoltesFiltrades.length;
    }
  },
  watch: {
    //No deixem seleccionades sol·licituds que el filtre ha amagat, perquè no es tornin a signar sense voler
    solicitudsResoltesFiltrades(visibles: SolicitudConvalidacio[]) {
      const ids = new Set(visibles.map(s => s.id));
      const seleccionades = this.selectedResoltes.filter(s => ids.has(s.id));
      if (seleccionades.length !== this.selectedResoltes.length) {
        this.selectedResoltes = seleccionades;
      }
    }
  },
  created() {
    this.get();
  },
  methods: {
    get: async function () {
      const dialog = this.$q.dialog({
        message: 'Carregant...',
        progress: true, // we enable default settings
        persistent: true, // we want the user to not be able to close it
        ok: false // we want the user to not be able to close it
      })

      const columnes:QTableColumn[] = [
        {
          name: 'alumne',
          required: true,
          label: 'Alumne',
          align: 'left',
          field: row => (row.alumne)?row.alumne.cognom1 + " " + row.alumne.cognom2 + ", " + row.alumne.nom:row.cognomsAlumneManual + ", " +row.nomAlumneManual,
          sortable: true
        },
        {
          name: 'datacreacio',
          required: true,
          label: 'Data creació',
          align: 'left',
          field: row => (row.dataCreacio)?new Date(row.dataCreacio).toLocaleDateString():"",
          sortable: true
        },
        {
          name: 'estat',
          required: true,
          label: 'Estat',
          align: 'left',
          field: row => {
            if (row.estat === EstatSolicitudConvalidacio.RESOLT) {
              return "Convalidació resolta"
            } else if (row.estat === EstatSolicitudConvalidacio.PENDENT_SIGNATURA) {
              return "Convalidació pendent de signatura"
            } else if (row.estat === EstatSolicitudConvalidacio.PENDENT_RESOLUCIO) {
              return "Convalidació pendent de resolució per part de l'administració"
            } else if (row.estat === EstatSolicitudConvalidacio.CANCELAT){
              return "Convalidació cancel·lada per part de l'administració"
            } else if (row.estat === EstatSolicitudConvalidacio.STAND_BY){
              return "Convalidació en espera"
            }
          },
          sortable: true
        }
      ]

      const columnaAccions:QTableColumn = {
        name: 'accions',
        required: true,
        label: 'Accions',
        align: 'center',
        field: row => row.id,
        sortable: true
      }

      const columnesSolicitudsResoltes:QTableColumn[] = [
        {
          name: 'alumne',
          required: true,
          label: 'Alumne',
          align: 'left',
          field: row => (row.alumne)?row.alumne.cognom1 + " " + row.alumne.cognom2 + ", " + row.alumne.nom:row.cognomsAlumneManual + ", " +row.nomAlumneManual,
          sortable: true,
          style: 'min-width: 140px'
        },
        {
          name: 'datasignatura',
          required: true,
          label: 'Data signatura',
          align: 'left',
          field: row => row.dataSignatura || '',
          format: val => val ? new Date(val).toLocaleString('ca-ES', {day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'}) : '',
          sort: (a, b) => (a ? Date.parse(a) : 0) - (b ? Date.parse(b) : 0),
          sortable: true,
          style: 'white-space: nowrap'
        },
        {
          name: 'Grup',
          required: true,
          label: 'Grup',
          align: 'left',
          field: row => {
            if(row.alumne && row.alumne.grup){
              return row.alumne.grup.nom
            }
            return ""
          },
          sortable: true
        },
        {
          name: 'estudis',
          required: true,
          label: 'Estudis',
          align: 'left',
          field: row => row.estudisEnCurs.nom,
          sortable: true,
          style: 'min-width: 140px; max-width: 240px'
        },
        {
          name: 'convalidacions_aprovades',
          required: true,
          label: 'Convalidacions aprovades',
          align: 'left',
          field: row => {
            const resolucions = row.resolucions.filter((r:any)=>r.estat==='APROVAT').map((r:any)=>{
              const codi = r.estudi.codi;
              const nomEstudi = r.estudi.nom;
              const qualificacio = r.qualificacio;
              let result = "";
              if(codi){
                result += codi+" - ";
              }
              result += nomEstudi;
              if(qualificacio){
                result += " ("+qualificacio+")"
              }
              return result;
            })
            return resolucions.join(", ")
          },
          sortable: true,
          style: 'min-width: 160px; max-width: 320px; font-size: 12px'
        },
        {
          name: 'convalidacions_denegades',
          required: true,
          label: 'Convalidacions denegades',
          align: 'left',
          field: row => {
            const resolucions = row.resolucions.filter((r:any)=>r.estat==='DENEGAT').map((r:any)=>{
              const codi = r.estudi.codi;
              const nomEstudi = r.estudi.nom;
              let result = "";
              if(codi){
                result += codi+" - ";
              }
              result += nomEstudi;

              return result;
            })
            return resolucions.join(", ")
          },
          sortable: true,
          style: 'min-width: 160px; max-width: 320px; font-size: 12px'
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

      this.columnesPendentResolucio = [...columnes];
      this.columnesPendentResolucio.push(columnaAccions)
      this.columnesPendentSignatura = [...columnes];
      this.columnesPendentSignatura.push(columnaAccions)
      this.columnesResoltes = [...columnesSolicitudsResoltes];
      this.columnesStandBy = [...columnes];
      this.columnesStandBy.push(columnaAccions)
      this.columnesCancelades = [...columnes];
      this.columnesCancelades.push(columnaAccions)

      const solicitudsPromise: Promise<Array<SolicitudConvalidacio>> = ConvalidacioService.getSolicituds2();
      const solicituds:Array<SolicitudConvalidacio> = await Promise.all(await solicitudsPromise);

      //console.log("Solicituds",solicituds)
      this.solicitudsPendentResolucio = solicituds.filter(s=>s.estat===EstatSolicitudConvalidacio.PENDENT_RESOLUCIO);
      this.solicitudsPendentSignatura = solicituds.filter(s=>s.estat===EstatSolicitudConvalidacio.PENDENT_SIGNATURA);
      this.solicitudsResoltes = solicituds.filter(s=>s.estat===EstatSolicitudConvalidacio.RESOLT);
      this.solicitudsCancelades = solicituds.filter(s=>s.estat===EstatSolicitudConvalidacio.CANCELAT);
      this.solicitudsStandBy = solicituds.filter(s=>s.estat===EstatSolicitudConvalidacio.STAND_BY);
      //console.log(solicituds)

      dialog.hide();
    },
    esborrarSolicitud(id: number) {
      this.$q.dialog({
        title: 'Confirm',
        message: 'Vol eliminar aquesta sol·licitud?',
        ok: "D'acord",
        cancel: "Cancel·la",
        persistent: true
      }).onOk(async () => {
        console.log('>>>> OK', id)
        await ConvalidacioService.esborrarSolicitud(id);
        //Refresh data
        setTimeout(function () {
          window.location.reload();
        }, 1000);
      })
    },
    async downloadResolucio(id:number){
      const fitxer:null | FitxerBucket = await ConvalidacioService.getURLResolucio(id);
      if(fitxer && fitxer.url){
        window.open(fitxer.url, '_blank');
      }
    },
    changeEstat(id: number,estat:string) {
      let estatMsg = "";
      if(estat==='pendent'){
        estatMsg = "Pendent"
      } else if(estat==='standby'){
        estatMsg = "En Espera"
      } else if(estat==='resolt'){
        estatMsg = "Resolt"
      } else if(estat==='cancelat'){
        estatMsg = "Cancel·lat"
      }

      this.$q.dialog({
        title: 'Confirm',
        message: 'Vol canviar l\'estat d\'aquesta sol·licitut a '+estatMsg+'?',
        ok: "D'acord",
        cancel: "Cancel·la",
        persistent: true
      }).onOk(async () => {
        console.log('>>>> OK', id)
        await ConvalidacioService.canviarEstatSolicitud(id,estat);
        //Refresh data
        setTimeout(function () {
          window.location.reload();
        }, 1000);
      })
    },
    signaSolicituds: async function () {
      //Evitem llançar la signatura dues vegades (els correus s'enviarien repetits)
      if(this.signant){
        return;
      }
      this.signant = true;

      //Copiam i buidam la selecció perquè no es puguin tornar a signar les mateixes
      const solicituds = [...this.selectedPendentSignatura];
      this.selectedPendentSignatura = [];

      for(let solicitud of solicituds){
        try {
          await PDFService.generateSolicitud(solicitud,false,this.fileSignature,this.passwordSignature)
        } catch (e) {
          console.error("Error signant la sol·licitud", solicitud, e);
        }
      }
      //Redirect
      setTimeout(function () {
        window.location.reload();
      }, 1000);
    },
    filtraCursActual() {
      //El curs comença l'1 de setembre: abans de setembre som al curs que va començar l'any anterior
      const avui = new Date();
      const anyInici = avui.getMonth() >= 8 ? avui.getFullYear() : avui.getFullYear() - 1;
      const format = (d: Date) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
      this.filtreSignaturaDes = anyInici + '-09-01';
      this.filtreSignaturaFins = format(avui);
    },
    seleccionaResoltesFiltrades() {
      this.selectedResoltes = [...this.solicitudsResoltesFiltrades];
    },
    resignaSolicituds: async function () {
      //Evitem llançar la signatura dues vegades (els correus s'enviarien repetits)
      if(this.signant){
        return;
      }
      this.signant = true;

      //Copiam i buidam la selecció perquè no es puguin tornar a signar les mateixes
      const solicituds = [...this.selectedResoltes];
      this.selectedResoltes = [];

      const resignatura = {
        correccio: this.resignaturaCorreccio,
        notificarTutors: this.resignaturaNotificarTutors
      };

      for(let solicitud of solicituds){
        try {
          await PDFService.generateSolicitud(solicitud,false,this.fileSignature,this.passwordSignature,resignatura)
        } catch (e) {
          console.error("Error tornant a signar la sol·licitud", solicitud, e);
        }
      }
      //Redirect
      setTimeout(function () {
        window.location.reload();
      }, 1000);
    },
     wrapCsvValue: function(val:any, formatFn?:any, row?:any) {
      let formatted = formatFn !== void 0
        ? formatFn(val, row)
        : val

      formatted = formatted === void 0 || formatted === null
        ? ''
        : String(formatted)

      formatted = formatted.split('"').join('""')
      /**
       * Excel accepts \n and \r in strings, but some other CSV parsers do not
       * Uncomment the next two lines to escape new lines
       */
      // .split('\n').join('\\n')
      // .split('\r').join('\\r')

      return `"${formatted}"`
    },
    exportTable: function(){
      // naive encoding to csv format
      const content = [this.columnesResoltes.map(col => this.wrapCsvValue(col.label))].concat(
        this.solicitudsResoltesFiltrades.map( (row:any) => this.columnesResoltes.map(col => (col.name!=='accions')?this.wrapCsvValue(
          typeof col.field === 'function'
            ? col.field(row)
            : row[ col.field === void 0 ? col.name : col.field ],
          col.format,
          row
        ):'').join(','))
      ).join('\r\n')

      const status = exportFile(
        'table-export.csv',
        content,
        'text/csv'
      )

      if (status !== true) {
        this.$q.notify({
          message: 'Browser denied file download...',
          color: 'negative',
          icon: 'warning'
        })
      }
    }
  }
})
</script>
