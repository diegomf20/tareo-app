<template>
    <div class="row">
        <div class="col-sm-6">
             <div class="card">
                <div class="card-body">
                    <div class="row">
                        <div class="col-12">
                            **Escanear Codigo con PDA**
                            <form v-on:submit.prevent="guardar(codigo_barras)">
                                <Input title="Codigo de Barras" type="number" :focusSelect="status_focus" v-model="codigo_barras"></Input>
                                <button type="submit" hidden></button>
                            </form>
                            <div v-if="alert!=null" :class="'alert alert-'+alert.status" role="alert">
                                {{ alert.data }}
                            </div>
                        </div>
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
            status_focus: true,
            turnos:[],
            codigo_barras: null,
            respuesta: null,
            // turno_id: 0,
            alert: null,
            error: null,
            barcode: '',
            reading: false
        }
    },
    computed: {
        ...mapState(['cuenta']),
    },
    created() {
        document.addEventListener("keydown",this.pda);
    },
    beforeDestroy() {
        document.removeEventListener("keydown",this.pda);
    },
    methods: {
        pda(e) {
            const textInput = e.key || String.fromCharCode(e.keyCode);
            if (textInput=="Enter"&&this.barcode!="") {
                this.guardar(this.barcode);
                this.barcode="";
            }else if (textInput!="Enter") {
                this.barcode+=textInput;
            }

            if(!this.reading){
                this.reading=true;
                setTimeout(()=>{
                    this.barcode="";
                    this.reading=false;
                }, 200);
            }
        },
        url(foto){
            return url_base+'/../storage/operador/'+foto;
        },
        guardar(codigo){
            this.$nextTick(() =>{
                if (codigo.length==8) {
                    this.codigo_barras=null;
                    var t=this;

                    db.transaction((tx)=>{
                        var query_add="INSERT INTO MARCAS(codigo_operador,fecha,fundo_id) VALUES (?,?,?)";
                        var params=[codigo,moment().format('YYYY-MM-DD HH:mm'),t.cuenta.fundo_id];
                        tx.executeSql(query_add, params, function(tx, res) {
                            t.marcaRegistrada();
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