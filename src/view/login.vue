<template>
    <div class="">
        <div class="login">
            <div class="bg-login">
                <img src="img/logo-blanco.png" alt="">
            </div>
            <div class="container">
                <div class="row">
                    <div class="col-lg-4 col-sm-6">
                        <div class="card card-login my-3">
                            <div class="card-body">
                                <h4 class="text-center">Tareo Movil</h4>
                                <br>
                                <form v-on:submit.prevent="seleccionarFundo">
                                    <Input title="USUARIO" v-model="cuenta.usuario"></Input>
                                    <Input title="CONTRASEÑA" type="password" v-model="cuenta.password"></Input>
                                    <div class="text-center">
                                        <button type="submit" class="btn btn-success">
                                            Ingresar
                                        </button>  
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div id="modal-fundos" class="modal" tabindex="-1" role="dialog">
            <div class="modal-dialog modal-dialog-centered" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Seleccionar Fundo</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <select class="form-control mb-3" v-model="fundo_id">
                            <option v-for="fundo in fundos" :value="fundo">{{ fundo}}</option>
                        </select>
                        <div class="text-center">
                            <button @click="ingresar" type="submit" class="btn btn-danger">
                                Continuar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import Input from '../dragon-desing/dg-input.vue'

export default {
    components:{
        Input
    },
    data() {
        return {
            cuenta:{
                usuario: null,
                password: null
            },
            fundos:[],
            fundo_id: null,
            cuenta_logeada: null
        }
    },
    mounted() {
        // this.listarFundo();
    },
    methods: {
        listarFundo(){
            axios.get(url_base+'/fundo?all=true')
            .then(response => {
                var respuesta=response.data;
                this.fundos=respuesta;
                if (this.fundos.length>0) {
                    this.fundo_id=this.fundos[0].id;
                }
            });
        },
        ingresar(){
            this.cuenta_logeada.fundo_id=this.fundo_id;
            this.$store.commit('auth_success', this.cuenta_logeada);
            this.$router.push({path: "/"} );
        },
        seleccionarFundo(){
            axios.post(url_base+'/login?fundo_id='+this.fundo_id,this.cuenta)
            .then(response => {
                var respuesta=response.data;
                switch (respuesta.status) {
                    case "ERROR":
                        swal("", respuesta.data, "error");
                        break;
                    case "OK":
                        // swal("", "Cuenta Iniciada.", "success");
                        this.cuenta_logeada=respuesta.data;
                        axios.get(url_base+'/privilegios',{ headers: {"Authorization" : `${this.cuenta_logeada.api_token}`} })
                        .then(response => {
                            this.fundos=response.data;
                            if (this.fundos.length>0) {
                                this.fundo_id=this.fundos[0].id;
                            }
                        });
                        $('#modal-fundos').modal();
                        break;
                    default:
                        break;
                }
            }).catch(function(err) {
                swal("", 'Error de conexión ' + err, "error");
            });
        }
    },
}
</script>