<template>
    <div class="row">
        <div class="col-sm-6">
             <div class="card">
                 <div class="card-header">
                    <h4 class="card-title">Registro de Marcación</h4>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-12">
                            <form v-on:submit.prevent="guardar()">
                                <Input title="Codigo de Barras" type="number" :focusSelect="true" v-model="codigo_barras"></Input>
                                <button type="submit" hidden></button>
                            </form>
                        </div>
                    </div>
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
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import { mapState,mapMutations } from 'vuex'

import Input from '../dragon-desing/dg-input.vue'
export default {
    components:{
        Input
    },
    data() {
        return {
            turnos:[],
            codigo_barras: null,
            respuesta: null,
            // turno_id: 0,
            alert: null,
            error: null,
        }
    },
    computed: {
        ...mapState(['cuenta']),
    },
    mounted() {
    },

    methods: {
        url(foto){
            return url_base+'/../storage/operador/'+foto;
        },
        guardar(){
            this.$nextTick(() =>{
                if (this.codigo_barras.length==8) {
                    var cod_barras_paso=this.codigo_barras;
                    this.codigo_barras=null;
                    // console.log(cod_barras_paso);
                    var t=this;
                    db.transaction((tx)=>{
                        tx.executeSql('CREATE TABLE IF NOT EXISTS MARCADOR (codigo_operador,ingreso,salida,fundo_id,enviado)');
                        // console.log(t.alert);
                        
                        /**
                         * Comprobacion.
                         */
                        var anterior_marca=null;

                        tx.executeSql('SELECT rowid,* FROM MARCADOR WHERE codigo_operador=? ORDER BY rowid DESC LIMIT 1', [cod_barras_paso], function (tx, results) {
                            // console.log(t.cuenta);
                            
                            for (let j = 0; j < results.rows.length; j++) {
                                anterior_marca = results.rows.item(j);
                            }

                            if (anterior_marca!=null) {
                                var fecha_limite = moment().subtract(1,'minutes');
                                
                                if(
                                    (anterior_marca.salida==null&&moment().diff(anterior_marca.ingreso,'minutes')<1)
                                    ||(anterior_marca.salida!=null&&moment().diff(anterior_marca.salida,'minutes')<1)) {
                                    t.alert={
                                        status: "warning",
                                        data: "Usted Marco recientemente"
                                    }
                                }else{
                                    var hora_fecha_actual=moment();
                                    var hora_fecha_limite=moment().startOf('day').add(6,'hours');
                                    var fecha_ayer=moment().subtract(1,'days').format('YYYY-MM-DD');
                                    if (
                                        anterior_marca==null||
                                        anterior_marca.salida!=null||
                                        (
                                            anterior_marca.salida==null&&
                                            fecha_ayer==moment(anterior_marca.ingreso).format('YYYY-MM-DD')&&
                                            hora_fecha_actual>hora_fecha_limite
                                        )
                                    ) 
                                    {
                                        /**
                                         * Agregar Marca
                                         */
                                        
                                        tx.executeSql('INSERT INTO MARCADOR (codigo_operador,ingreso,fundo_id,enviado) VALUES (?,?,?,"NO")',[cod_barras_paso,moment().format('YYYY-MM-DD HH:mm'),t.cuenta.fundo_id],t.marcaRegistrada); 
                                        // console.log('inserta');
                                                                       
                                    }else{
                                        // console.log('actualiza');
                                        /**
                                         * Actualizar Marca
                                         */
                                        tx.executeSql('UPDATE MARCADOR SET salida="'+moment().format('YYYY-MM-DD HH:mm')+'" WHERE rowid=?',[anterior_marca.rowid],t.marcaRegistrada);
                                    }




                                }
                                    // return response()->json([
                                    //         "status"    =>  "ERROR",
                                    //         "data"      =>  "Usted marco recientemente"
                                    //     ]);
                                
                            }else{
                                tx.executeSql('INSERT INTO MARCADOR (codigo_operador,ingreso,fundo_id,enviado) VALUES (?,?,?,"NO")',[cod_barras_paso,moment().format('YYYY-MM-DD HH:mm'),t.cuenta.fundo_id],t.marcaRegistrada);                                
                            }

                        });
                    });
                }else{
                    this.codigo_barras=null;
                    this.alert={
                        status: 'danger',
                        data: 'Código no Valido'
                    }
                    this.clearAlert();
                }
            })
        },
        marcaRegistrada(){
            this.alert={
                status: 'info',
                data: 'Marca registrada.'
            };
        },
        clearAlert(){
            setTimeout(() => {
                this.alert=null;
            }, 10000);
        }
    },
}
</script>