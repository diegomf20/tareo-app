<template>
    <div class="row">
        <div class="col-sm-6">
            <!--Modal de pendientes-->
            <div id="modal-pendientes" class="modal" tabindex="-1" role="dialog">
                <div class="modal-dialog" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Lista de Pendientes ( {{ reporte.length }} )</h5>
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div class="modal-body">
                            <table class="table table-striped">
                                <thead>
                                    <tr>
                                        <th>DNI</th>
                                        <th>Nombre</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="item in reporte">
                                        <td>{{ item.codigo_operador }}</td>
                                        <td>{{ item.nom_operador }}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
             <div class="card">
                 <div class="card-header">
                    <h4 class="card-title text-center" v-if="isMovil">TAREO MOVIL <button class="btn btn-danger btn-sm btn-float-right" @click="openPendientes()">P</button></h4>
                    <h4 class="card-title text-center" v-else>TAREO <button class="btn btn-danger btn-sm btn-float-right" @click="openPendientes()">P</button></h4>
                </div>
                <div class="card-body">
                    <h5 class="mb-3">Fecha: {{ this.fecha }}</h5>
                    <Select title="Centro de Costo:" v-model="tareo.proceso_id">
                        <option value="">--SELECCIONAR C.COSTO--</option>
                        <option v-for="proceso in procesos" :value="proceso.id">{{ proceso.id+" - "+ proceso.nom_proceso }}</option>
                    </Select>
                    <Select title="Actividad:" v-model="tareo.area_id">
                        <option value="">--SELECCIONAR ACTIVIDAD--</option>
                        <option v-for="area in areas" :value="area.id">{{ area.nom_area }}</option>
                    </Select>
                    <Select title="Labor:" v-model="tareo.labor_id">
                        <option value="">--SELECCIONAR LABOR--</option>
                        <option v-for="labor in labores" :value="labor.id">{{ labor.nom_labor }}</option>
                    </Select>
                    <form v-on:submit.prevent="guardar()">
                        <Input title="Codigo de Barras" :focusSelect='focus' type="number" v-model="tareo.codigo_barras"></Input>
                        <button type="submit" hidden></button>
                    </form>
                </div>
             </div>
        </div>
        <div class="col-sm-6">
            <div class="card">
                <div class="card-header">
                    <h4 class="card-title">Respuesta</h4>
                </div>
                <div class="card-body">
                    <div v-if="alert!=null" :class="'alert alert-'+alert.status" role="alert">
                        {{ alert.data }}
                    </div>
                    <div v-if="respuesta!=null && respuesta.status=='OK'"  class="fotocheck text-center" style="margin-right: auto;margin-left: auto">
                        <img :src="url(respuesta.data.foto)" alt="">
                        <p><b>{{ respuesta.data.nom_operador.split(' ')[0] }} {{ respuesta.data.ape_operador.split(' ')[0] }}</b></p>
                        <hr>
                        <h6>Jayanca Fruits</h6>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import { mapState,mapMutations } from 'vuex'

import Input from '../dragon-desing/dg-input.vue'
import Select from '../dragon-desing/dg-select.vue'

export default {
    components:{
        Input,
        Select
    },
    data() {
        return {
            focus: true,
            isMovil:((navigator.userAgent).search('Android')>-1),
            tareo:{
                area_id:null,
                proceso_id:null,
                labor_id:null,
                linea_id:null,
                codigo_barras:null
            },
            fecha: moment().format('YYYY-MM-DD'),
            turnos:[],
            lineas:[],
            areas:[],
            procesos:[],
            /**Estado de registro */
            respuesta: null,
            alert: null,
            /**Lista de Pendientes */
            reporte:[],
            areasLabor:[]
        }
    },
    mounted() {
        
        this.listarProcesos();
        this.listarAreasLabor();        
    },
    computed: {
        ...mapState(['cuenta']),
        labores(){
            for (let i = 0; i < this.areas.length; i++) {
                const area = this.areas[i];
                if (area.id==this.tareo.area_id) {
                    this.tareo.labor_id=null;
                    return area.labores;
                }
            }
            return [];
        }
    },
    methods: {
        url(foto){
            return url_base+'/../storage/operador/'+foto;
        },
        listarAreasLabor(){
            var t=this;
            db.transaction((tx)=>{
                tx.executeSql('SELECT * FROM AREA', [], function (tx, results) {
                    t.areas=[];
                    
                    for (let i = 0; i < results.rows.length; i++) {
                        var area=results.rows.item(i);
                        area.labores=[];
                        t.areas.push(area);
                        tx.executeSql('SELECT "'+i+'" as i , LABOR.* FROM LABOR WHERE area_id="'+area.id+'" ORDER BY rowid DESC', [], function (tx, results2) {
                            var labores=[];
                            for (let j = 0; j < results2.rows.length; j++) {
                                var labor = results2.rows.item(j);
                                labores.push(labor);
                            }
                            t.areas[labor.i].labores=labores;
                        },errorCB)
                    }
                }); 
            });
        },
        listarProcesos(){
            var t=this;
            db.transaction((tx)=>{
                tx.executeSql('SELECT * FROM PROCESO WHERE fundo_id=? OR fundo_id is NULL OR fundo_id=""', [this.cuenta.fundo_id], function (tx, results) {
                    t.procesos=[];
                    for (let i = 0; i < results.rows.length; i++) {
                        t.procesos.push(results.rows.item(i));
                    }
                }); 
            },errorCB); 
        },
        guardar(){
            this.$nextTick(() =>{
                var t=this;
                if (((null==this.tareo.codigo_barras) ? '' : this.tareo.codigo_barras ).length==8) {
                    if (t.tareo.codigo_barras!=null&&t.tareo.proceso_id!=null&&t.tareo.labor_id!=null&&t.tareo.area_id!=null) {
                        db.transaction((tx)=>{
                            var query='SELECT * FROM ASISTENCIA WHERE fecha_ref=? AND codigo_operador=?';
                            tx.executeSql( query, [ moment().format('YYYY-MM-DD'),t.tareo.codigo_barras], 
                            function (tx, results) {
                                var message="";
                                // console.log(results)
                                // console.log(results.rows.length);
                                
                                if (results.rows.length>0) {
                                    message="Tareo Correcto: ("+results.rows.item(0).nom_operador+")";
                                }else{
                                    message="Tareo sin asistencia";
                                }
                                
                                tx.executeSql('INSERT INTO TAREO(codigo_operador,proceso_id,labor_id,area_id,fecha,fundo_id,enviado,cuenta_id) VALUES (?,?,?,?,?,?,"NO",?)',
                                [t.tareo.codigo_barras,t.tareo.proceso_id,t.tareo.labor_id,t.tareo.area_id,moment().format('YYYY-MM-DD'),t.cuenta.fundo_id,t.cuenta.id],()=>{
                                    t.tareo.codigo_barras=null;
                                    t.alert={
                                        status: 'success',
                                        data: message
                                    }
                                },errorCB);              
                            },errorCB, successCB);
                        }, errorCB, successCB);
                    }else{
                        t.alert={
                            status: 'danger',
                            data: 'Campos Vacios.'
                        }

                    }
                }else{
                    this.tareo.codigo_barras=null;
                    this.alert={
                        status: 'danger',
                        data: 'Código no Valido'
                    }
                }
            })
        },
        openPendientes(){
            var t=this;
            db.transaction((tx)=>{
                var query='SELECT A.codigo_operador,A.nom_operador FROM ASISTENCIA as A '+
                        'LEFT JOIN (SELECT * FROM TAREO '+
                            'WHERE TAREO.fundo_id="'+t.cuenta.fundo_id+'" '+
                                'AND TAREO.fecha="'+moment().format('YYYY-MM-DD')+'") as T  '
                        +'ON A.codigo_operador=T.codigo_operador '+
                        'WHERE T.labor_id is NULL AND '
                        +'A.fundo_id="'+t.cuenta.fundo_id+'" AND A.fecha_ref=? '+'GROUP BY A.codigo_operador,A.nom_operador';
                console.log(query);
                tx.executeSql(
                    query, 
                [
                    moment().format('YYYY-MM-DD')
                ], function (tx, results) {
                    t.listaTareo=[];
                    t.reporte=[];
                    for (let i = 0; i < results.rows.length; i++) {
                        t.reporte.push(results.rows.item(i));
                    }
                },errorCB, successCB);
            }, errorCB, successCB);
            $('#modal-pendientes').modal();
        }
    },
}
</script>