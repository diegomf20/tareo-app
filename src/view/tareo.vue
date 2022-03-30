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
                <div class="card-body">
                    <h5 class="mb-3">Fecha: {{ this.fecha }}</h5>
                    <Select title="Centro de Costo:" v-model="tareo.proceso_id">
                        <option value="">--SELECCIONAR C.COSTO--</option>
                        <option v-for="proceso in procesos" :value="proceso.id">{{ proceso.id+" - "+ proceso.nom_proceso }}</option>
                    </Select>
                    <div class="row">
                        <div class="col-12">
                            <div class="form-group">
                                <label for="">Actividad</label>
                                <select v-model="tareo.area_id" class="form-control">
                                    <option v-for="area in areas" :value="area.id">{{ area.nom_area }}</option>
                                </select>
                            </div>
                        </div>
                        <div class="col-9">
                            <div class="form-group">
                                <label for="">Labores</label>
                                <select v-model="tareo.labor_id" class="form-control">
                                    <option v-for="labor in labores" :value="labor.id">{{ labor.nom_labor}}</option>
                                </select>
                            </div>
                        </div>
                        <div class="col-3">
                            <div class="form-group">
                                <button @click="openSearch()" type="submit" class="btn btn-primary">
                                    <i class="fas fa-search"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                    <form v-on:submit.prevent="guardar()">
                        <Input title="Codigo de Barras" :focusSelect='focus' type="number" v-model="tareo.codigo_barras"></Input>
                        <button type="submit" hidden></button>
                    </form>
                    <div v-if="alert!=null" :class="'alert alert-'+alert.status" role="alert">
                        {{ alert.data }}
                    </div>
                </div>
             </div>
        </div>
        <div class="col-sm-6">
            <div class="card">
                <div class="card-body">
                    <div v-if="respuesta!=null && respuesta.status=='OK'"  class="fotocheck text-center" style="margin-right: auto;margin-left: auto">
                        <img :src="url(respuesta.data.foto)" alt="">
                        <p><b>{{ respuesta.data.nom_operador.split(' ')[0] }} {{ respuesta.data.ape_operador.split(' ')[0] }}</b></p>
                        <hr>
                    </div>
                </div>
            </div>
        </div>
        <div id="modal-labor" class="modal" tabindex="-1" role="dialog">
            <div class="modal-dialog modal-dialog-centered" role="document">
                <div class="modal-content">
                    <div class="modal-body">
                        <div class="row mb-3">
                            <div class="col-8">
                                <h6 class="modal-title">Buscar Labor</h6>
                            </div>
                            <div class="col-4">
                                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                    x
                                </button>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-8"><Input title="Search" v-model="input_labor"></Input></div>
                            <div class="col-4"><button @click="searchLabor()" class="btn btn-primary">Buscar</button></div>
                        </div>
                        <select class="form-control mb-3" v-model="index_select">
                            <option v-for="(labor,i) in laborSearch" :key="i" :value="i">
                                {{ `${labor.area_id} - ${labor.labor_id} - ${labor.nom_labor}`}}
                            </option>
                        </select>
                        <div class="text-center">
                            <button @click="selectLabor()" type="submit" class="btn btn-success">
                                Continuar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<style>
.form-group{
    position: relative;
}
.form-group>label{
    position: absolute;
    left: 16px;
    top: 2px;
    font-size: 8px;
    font-weight: 500;
}
.form-control{
    border: 1px solid #c2c2c2;
    height: 40px;
    font-size: 0.90rem;
    font-weight: 500;

}
.form-control:focus{
    border: 2px solid var(--success-color);
    box-shadow: none;
}

</style>
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
            labores: [],
            procesos:[],
            /**Estado de registro */
            respuesta: null,
            alert: null,
            /**Lista de Pendientes */
            reporte:[],
            areasLabor:[],
            laborSearch: [],

            index_select: -1,


            input_labor: ''
        }
    },
    mounted() {
        this.listarProcesos();
        this.listarAreasLabor();    
    },
    watch: {
        'tareo.area_id'(newValue,oldValue){
            console.warn(newValue);
            this.labores=[];
            for (let i = 0; i < this.areas.length; i++) {
                const area = this.areas[i];
                if (area.id==newValue) {
                    if (this.index_select==-1) {
                        this.tareo.labor_id=null;
                    }
                    this.labores=area.labores;
                }
            }
        }
    },
    computed: {
        ...mapState(['cuenta']),
    },
    methods: {
        url(foto){
            return url_base+'/../storage/operador/'+foto;
        },
        openSearch(){
            $('#modal-labor').modal();
        },
        searchLabor(){
            console.info("Ingreso a Seach Labor.")
            db.transaction((tx)=>{
                tx.executeSql(
                    `SELECT LA.id as labor_id,
                            area_id,
                            nom_labor,
                            nom_area 
                    FROM labor as LA 
                    INNER JOIN area as AR ON LA.area_id=AR.id
                    WHERE LA.nom_labor LIKE '%${this.input_labor}%'`,
                    [],
                    (tx, results) =>{
                        var labor_actividades=[];
                        for (let j = 0; j < results.rows.length; j++) {
                            labor_actividades.push(results.rows.item(j));
                        }
                        this.laborSearch=labor_actividades;
                        this.index_select=0;
                    }
                ,function (error) {
                    console.log(error);
                })
            });
        },
        selectLabor(){
            var labor=this.laborSearch[this.index_select];
            this.tareo.labor_id=labor.labor_id;
            this.tareo.area_id=labor.area_id;
            $('#modal-labor').modal('hide');
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
                tx.executeSql('SELECT * FROM PROCESO WHERE fundo_id=? OR fundo_id="null"', [this.cuenta.fundo_id], function (tx, results) {
                    t.procesos=[];
                    for (let i = 0; i < results.rows.length; i++) {
                        t.procesos.push(results.rows.item(i));
                    }
                }); 
            },errorCB); 
        },
        guardar(){
            this.$nextTick(() =>{
                if (((null==this.tareo.codigo_barras) ? '' : this.tareo.codigo_barras ).length==8) {
                    if (this.tareo.codigo_barras!=null&&this.tareo.proceso_id!=null&&this.tareo.labor_id!=null&&this.tareo.area_id!=null) {
                        db.transaction((tx)=>{
                            var query='SELECT * FROM ASISTENCIA WHERE fecha_ref=? AND codigo_operador=?';
                            var parametros=[moment().format('YYYY-MM-DD'),this.tareo.codigo_barras]
                            tx.executeSql( query, parametros, 
                            (tx, results) =>{
                                var message= (results.rows.length>0) ? "Tareo Correcto: ("+results.rows.item(0).nom_operador+")" : `Tareo sin asistencia: (${this.tareo.codigo_barras})`;
                                
                                tx.executeSql('INSERT INTO TAREO(codigo_operador,proceso_id,labor_id,area_id,fecha,fundo_id,enviado,cuenta_id) VALUES (?,?,?,?,?,?,"NO",?)',
                                [
                                    this.tareo.codigo_barras,
                                    this.tareo.proceso_id,
                                    this.tareo.labor_id,
                                    this.tareo.area_id,
                                    moment().format('YYYY-MM-DD'),
                                    this.cuenta.fundo_id,
                                    this.cuenta.id
                                ],()=>{
                                    navigator.vibrate([500,100,500]);
                                    this.tareo.codigo_barras=null;
                                    this.showAlerta('success',message);
                                },errorCB);              
                            },errorCB, successCB);
                        }, errorCB, successCB);
                    }else{
                        this.tareo.codigo_barras=null;
                        this.alert={
                            status: 'danger',
                            data: 'Campos Vacios.'
                        }
                        this.showAlerta('danger','Campos Vacios.');
                    }
                }else{
                    this.tareo.codigo_barras=null;
                    this.showAlerta('danger','Código no Valido');
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
        },
        showAlerta(status,data){
            this.alert={
                status: status,
                data: data
            }
            setTimeout(() => {
                this.alert={
                    status: null,
                    data: null
                }
            }, 1000);
        }
    },
}
</script>