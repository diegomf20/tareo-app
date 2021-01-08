<template>
    <div id="app" :class="(statusSidebar) ? 'open':''">
        <div class="sidebar" v-if="cuenta!=null">
            <div class="sidebar-content">
                <img src="img/logo.png" alt="">
            </div>
            <hr>
            <comun></comun>
            <hr>
            <div class="sidebar-content">
                <button @click="cerrar()" class="btn btn-danger btn-sm btn-float-right">
                    Salir <i class="fas fa-sign-out-alt"></i>
                </button>            
            </div>
        </div>
        <div class="background-sidebar" @click="close()"></div>
        <nav class="navbar" v-if="cuenta!=null">
            <a class="navbar-button" @click="open()">
                <i class="fas fa-bars"></i>
            </a>
            <div class="container-fluid">
                <h5 class="text-center mb-0">{{ `${cuenta.fundo_id} - ${title}` }}</h5>
            </div>
        </nav>
        <div class="content">
            <slot/>
        </div>
    </div>
</template>
<script>
import { mapState,mapMutations } from 'vuex'
import comun from './parts/comun.vue'

export default {
    components:{
        comun
    },
    computed:{
        title(){
            return this.$route.meta.title;
        },
        ...mapState(['cuenta']),
        ...mapState('sidebar',['statusSidebar']),
    },
    mounted() {
    },
    methods: {
        ...mapMutations('sidebar',['open','close']),
        url(){},
        cerrar(){
            this.$store.commit('auth_close');
            this.$router.push({path: "/login"} );
        }
    },
}
</script>