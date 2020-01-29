<template>
    <div class="container">
        <div class="login">
            <div class="row">
                <div class="col-lg-4 col-sm-6 text-center">
                    <img src="img/logo.png" alt="" style="width:100px">
                </div>
                <div class="col-lg-4 col-sm-6">
                    <div class="card card-login my-3">
                        <div class="card-body">
                            <form v-on:submit.prevent="ingresar">
                                <Input title="Usuario" v-model="cuenta.usuario"></Input>
                                <Input title="Contraseña" type="password" v-model="cuenta.password"></Input>
                                <select class="form-control mb-3" v-model="fundo_id">
                                    <option v-for="fundo in fundos" :value="fundo.id">{{ fundo.nom_fundo }}</option>
                                </select>
                                <div class="text-center">
                                    <button type="submit" class="btn btn-danger">
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
            fundo_id: null
        }
    },
    mounted() {
        this.listarFundo();
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
            axios.post(url_base+'/login?fundo_id='+this.fundo_id,this.cuenta)
            .then(response => {
                var respuesta=response.data;
                switch (respuesta.status) {
                    case "ERROR":
                        swal("", respuesta.data, "error");
                        break;
                    case "OK":
                        swal("", "Cuenta Iniciada.", "success");
                        var usuario=respuesta.data;
                        usuario.fundo_id=this.fundo_id;
                        this.$store.commit('auth_success', usuario);
                        this.$router.push({path: "/"} );
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