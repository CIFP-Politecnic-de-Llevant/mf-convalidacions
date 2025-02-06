<template>
  <q-page class="flex column" padding>

    <p class="text-h3">Alumne</p>

    <div v-if="solicitud.nomAlumneManual || solicitud.cognomsAlumneManual">
      <p>Alumne sol·licitant: <strong>{{solicitud.cognomsAlumneManual}}, {{solicitud.nomAlumneManual}}</strong></p>
    </div>

    <p>Alumne: {{solicitud.alumne}}</p>

    <p class="text-h3  q-mt-lg">Estudis cursats anteriorment</p>

    <p>{{(solicitud.estudisOrigen)?solicitud.estudisOrigen.map(e=>e.nom).join(", "):"Sense estudis d'origen"}}</p>

    <div v-for="estudiOrigen in solicitud.estudisOrigen">
      <p class="text-h6">- {{estudiOrigen.categoria.nom}}: {{estudiOrigen.codi}}-{{estudiOrigen.nom}}</p>
      <div v-if="estudiOrigen.composa && estudiOrigen.composa.length > 0">
        <q-list>
          <q-item v-for="item in estudiOrigen.composa" clickable dense class="q-mb-md">
            <q-item-section top class="col-10 q-ma-none flex row">
              <p>{{item.categoria.nom}}: {{item.codi}}-{{item.nom}} - <span v-if="item.selected">Si</span><span v-if="!item.selected">No</span></p>
            </q-item-section>
          </q-item>
        </q-list>
      </div>
    </div>

    <p v-if="estudisOrigenManualChecked">Tinc estudis cursats que no apareixen al llistat</p>
    <p>Especifiqui els estudis cursats addicionals: {{solicitud.estudisOrigenManual}}</p>

    <p>Observacions sobre els estudis cursats anteriorment: {{solicitud.estudisOrigenObservacions}}</p>


    <p class="text-h3 q-mt-lg">Estudis actuals</p>

    <p>Estudis en curs al centre</p>
    <p>{{solicitud.estudisEnCurs.nom}}</p>

    <p class="text-h3 q-mt-lg">Convalidacions</p>
    <q-list>
      <q-item v-for="resolucio in solicitud.resolucions" clickable dense class="q-mb-md">
        <q-item-section top class="col-10 q-ma-none flex row">
          <q-checkbox v-model="resolucio.estudi.selected" :label="resolucio.estudi.codi+'-'+resolucio.estudi.nom+' ('+resolucio.estudi.categoria.nom+')'"/>
          <div v-if="resolucio.estudi.selected">
            <p>Estat de la resolució: {{mapEstatResolucioToLabel(resolucio.estat)}}</p>
            <p>Qualificació: {{resolucio.qualificacio}}</p>
          </div>
        </q-item-section>
      </q-item>
    </q-list>
    <p>Nota: les convalidacions marcades amb un asterisc (**) són automàtiques. Es faran efectives una vegada revisada la documentació per part de l'administració del centre.</p>

    <p>Observacions sobre els estudis que vol convalidar: {{solicitud.estudisEnCursObservacions}}</p>
    <p>Observacions per part de l'administració: {{solicitud.observacions}}</p>

    <p class="text-h3 q-mt-lg">Documents aportats</p>

    <q-list bordered separator>
      <q-item clickable v-ripple v-for="arxiu in solicitud.files">
        <q-item-section>
          <q-btn color="secondary" @click="openURL(arxiu.url)">
            <q-icon left size="3em" name="description" />
            <div>{{arxiu.nom}}</div>
          </q-btn>
        </q-item-section>
      </q-item>
    </q-list>
  </q-page>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import {ItemConvalidacio} from "src/model/ItemConvalidacio";
import {ConvalidacioService} from "src/service/ConvalidacioService";
import {Usuari} from "src/model/Usuari";
import {SolicitudConvalidacio} from "src/model/SolicitudConvalidacio";
import {UsuariService} from "src/service/UsuariService";
import {jsPDF} from "jspdf";
import {EstatResolucioConvalidacio, ResolucioConvalidacio} from "src/model/ResolucioConvalidacio";
import {PDFService} from "src/service/PDFService";


export default defineComponent({
  name: 'SolicitudForm',
  data() {
    return {
      solicitud: {} as SolicitudConvalidacio,
      estudisOrigenManualChecked: false,
      titulacions: [] as ItemConvalidacio[],
      titulacionsCentre: [] as ItemConvalidacio[],
      titulacionsFiltered: [] as ItemConvalidacio[],
      titulacionsCentreFiltered: [] as ItemConvalidacio[],
      alumnes: [] as Usuari[],
      alumnesFiltered: [] as Usuari[],
      optionsEstatResolucioConvalidacio: [] as string[],
      msgstatus: '',
      urlUpload: process.env.API + '/api/convalidacions/public/solicitud/upload',
    }
  },
  created() {
    this.get();
  },
  methods: {
    get: async function () {
      const dialog = await this.$q.dialog({
        message: 'Carregant...',
        progress: true, // we enable default settings
        persistent: true, // we want the user to not be able to close it
        ok: false // we want the user to not be able to close it
      })

      const titulacions:ItemConvalidacio[] = await  ConvalidacioService.getTitulacions();
      this.titulacions = titulacions.map((titulacio:ItemConvalidacio)=>{
        titulacio.label = "";
        if(titulacio.codi){
          titulacio.label +=  titulacio.codi+"-";
        }
        titulacio.label += titulacio.nom + ' ('+titulacio.categoria.nom+')';
        titulacio.value = titulacio.id!.toString();
        return titulacio;
      }).sort((a,b)=>a.label!.localeCompare(b.label!));
      this.titulacionsFiltered = this.titulacions

      const titulacionsCentre:ItemConvalidacio[] = await  ConvalidacioService.getTitulacionsImpartidesAlCentre();
      this.titulacionsCentre = titulacionsCentre.map((titulacio:ItemConvalidacio)=>{
        titulacio.label = "";
        if(titulacio.codi){
          titulacio.label +=  titulacio.codi+"-";
        }
        titulacio.label += titulacio.nom + ' ('+titulacio.categoria.nom+')';
        titulacio.value = titulacio.id!.toString();
        return titulacio;
      }).sort((a,b)=>a.label!.localeCompare(b.label!));
      this.titulacionsCentreFiltered = this.titulacionsCentre

      const usuaris:Usuari[] = await UsuariService.findUsuarisActius();
      this.alumnes = usuaris.filter((u:Usuari)=>u.esAlumne)
      this.alumnesFiltered = this.alumnes.sort((a,b)=>{
        if(!a.label){
          return 1;
        }
        if(!b.label){
          return -1;
        }
        return a.label.localeCompare(b.label)
      });

      this.optionsEstatResolucioConvalidacio.push(EstatResolucioConvalidacio.APROVAT.toString());
      this.optionsEstatResolucioConvalidacio.push(EstatResolucioConvalidacio.DENEGAT.toString());
      this.optionsEstatResolucioConvalidacio.push(EstatResolucioConvalidacio.PENDENT.toString());
      this.optionsEstatResolucioConvalidacio.push(EstatResolucioConvalidacio.PREAPROVAT.toString());

      const id:string = (this.$route.params.id)?this.$route.params.id+'':'';

      if(id && id!='') {
        console.log(id)
        const solicitud:SolicitudConvalidacio = await ConvalidacioService.getSolicitudById(parseInt(id));

        this.solicitud = Object.assign({},solicitud);

        //Alumne
        if (solicitud.alumne) {
          this.solicitud.alumne = this.alumnes.find(al => al.id == solicitud.alumne!.id)!;
        }
        //console.log("-->",JSON.parse(JSON.stringify(solicitud.estudisOrigen)))

        //Arxiu
        if(solicitud.files){

        }

        //Estudis origen
        this.solicitud.estudisOrigen = this.titulacions.filter(t=>solicitud.estudisOrigen.find(est=>est.id===t.id));
        this.solicitud.estudisOrigen.forEach(estudi=>{
          estudi.composa?.forEach((estudiFill:any)=>{
            //console.log("-->>",JSON.parse(JSON.stringify(solicitud.estudisOrigen)),JSON.parse(JSON.stringify(estudiFill)))
            estudiFill.selected = solicitud.estudisOrigen.find(est=>est.id===estudiFill.iditem)?true:false;
          })
        })

        if(this.solicitud.estudisOrigenManual){
          this.estudisOrigenManualChecked = true;
        }

        //Estudis en Curs
        this.solicitud.estudisEnCurs = this.titulacions.find(t=>solicitud.estudisEnCurs.id===t.id)!;

        //Resolucions
        this.solicitud.resolucions = new Array<ResolucioConvalidacio>();

        const estudisEnCurs:ItemConvalidacio[]|undefined = this.solicitud.estudisEnCurs?.composa?.sort((a:any,b:any)=>(a.codi)?a.codi.localeCompare(b.codi):-1);

        for(let estudiEnCurs of estudisEnCurs||[]){
          const estudi:ItemConvalidacio = await ConvalidacioService.mapToItemConvalidacio(estudiEnCurs);

          let estat = EstatResolucioConvalidacio.PENDENT;
          let qualificacio = "C-5"
          estudi.selected = false;
          if(solicitud.resolucions.find((r:any)=>r.estudi.iditem===estudi.id)){
            const resolucio:ResolucioConvalidacio = solicitud.resolucions.find((r:any)=>r.estudi.iditem===estudi.id)!;
            estat = resolucio.estat;
            qualificacio = resolucio.qualificacio;
            estudi.selected = true;
          }
          const resolucio:ResolucioConvalidacio = {
            estat: estat,
            qualificacio: qualificacio,
            estudi: estudi,
            observacions: ""
          }
          this.solicitud.resolucions.push(resolucio)
        }

        console.log(JSON.parse(JSON.stringify(this.solicitud)));
      }

      await dialog.hide();
    },
    alumneFilterFn (val:string, update:Function) {
      if (val === '') {
        update(() => {
          this.alumnesFiltered = this.alumnes;
        })
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        this.alumnesFiltered = this.alumnes.filter(i=>i.label && i.label!.toLowerCase().indexOf(needle) > -1 || false);
      })
    },
    titulacioFilterFn (val:string, update:Function) {
      if (val === '') {
        update(() => {
          this.titulacionsFiltered = this.titulacions;
        })
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        this.titulacionsFiltered = this.titulacions.filter(i=>i.label!.toLowerCase().indexOf(needle) > -1 || false);
      })
    },
    mapEstatResolucioToLabel(estat:EstatResolucioConvalidacio):string{
      if(estat===EstatResolucioConvalidacio.APROVAT){
        return "Convalidació aprovada per l'administració"
      } else if(estat===EstatResolucioConvalidacio.DENEGAT){
        return "Convalidació denegada per l'administració"
      } else if(estat===EstatResolucioConvalidacio.PENDENT){
        return "Convalidació pendent de resolució"
      } else if(estat===EstatResolucioConvalidacio.PREAPROVAT){
        return "Convalidació pre-aprovada. Aquesta convalidació serà aprovada una vegada verificats els estudis anteriors."
      }
      return "Sense estat"
    },
    generarPDF: async function(){
      await PDFService.generateSolicitud(this.solicitud,true);
    },
    uploadfile: function(response:any){
      if(!this.solicitud.files){
        this.solicitud.files = [];
      }
      this.solicitud.files?.push(response.xhr.responseText)
    },
    openURL: function(url:any){
      window.location = url;
    },
    save: async function(){
      if(!this.solicitud.alumne){
        this.msgstatus = "Ha de seleccionar un alumne";
        return;
      }

      if( (!this.solicitud.estudisOrigen || this.solicitud.estudisOrigen.length === 0) && !this.solicitud.estudisOrigenManual){
        this.msgstatus = "Ha de seleccionar com a mínim un estudi cursat anteriorment";
        return;
      }

      if(!this.solicitud.estudisEnCurs){
        this.msgstatus = "Ha de seleccionar un estudi que estigui cursant actualment al centre";
        return;
      }

      if(!this.solicitud.resolucions || this.solicitud.resolucions.length === 0){
        this.msgstatus = "Ha de seleccionar com a mínim una convalidació del llistat";
        return;
      }
      this.msgstatus = '';

      const dialog = await this.$q.dialog({
        message: 'Carregant...',
        progress: true, // we enable default settings
        persistent: true, // we want the user to not be able to close it
        ok: false // we want the user to not be able to close it
      })

      const solicitud = Object.assign({},this.solicitud);
      //Agafem només els estudis orígen seleccionats
      if(solicitud.estudisOrigen) {
        solicitud.estudisOrigen = solicitud.estudisOrigen.map(est => {
          est.composa = est.composa?.filter((estfill: any) => estfill.selected)
          return est
        })
      }
      //Agafem només les resolucions que estiguin seleccionades
      solicitud.resolucions = solicitud.resolucions.filter(r=>r.estudi.selected);
      await ConvalidacioService.saveSolicitud(solicitud);
      await dialog.hide();

      //Redirect
      await this.$router.push('/solicituds');
    }
  }
})
</script>
