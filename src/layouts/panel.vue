<template>
    <div id="app" :class="(statusSidebar) ? 'open':''">
        <div class="sidebar" v-if="cuenta!=null">
            <div class="sidebar-content">
                <img src="/img/logo.png" alt="">
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
            <a @click="open()">
                <i class="fas fa-bars"></i>
            </a>
            <h5 >{{ cuenta.fundo_id }}</h5>
            
            <!-- <div class="collapse navbar-collapse" id="navbarSupportedContent">
                <ul class="navbar-nav mr-auto">
                    <li class="nav-item active">
                        <a class="nav-link" href="#">Home <span class="sr-only">(current)</span></a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="#">Link</a>
                    </li>
                    <li class="nav-item dropdown">
                        <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        Dropdown
                        </a>
                        <div class="dropdown-menu" aria-labelledby="navbarDropdown">
                        <a class="dropdown-item" href="#">Action</a>
                        <a class="dropdown-item" href="#">Another action</a>
                        <div class="dropdown-divider"></div>
                        <a class="dropdown-item" href="#">Something else here</a>
                        </div>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link disabled" href="#" tabindex="-1" aria-disabled="true">Disabled</a>
                    </li>
                </ul>
            </div> -->
        </nav>
        <div class="content">
            <slot/>
        </div>
    </div>
</template>
<script>
import { mapState,mapMutations } from 'vuex'
import administrador from './parts/administrador.vue'
import comun from './parts/comun.vue'

export default {
    components:{
        administrador,
        comun
    },
    computed: {
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