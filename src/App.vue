<template>
    <div>
        <component :is="layout">
            <router-view></router-view>
        </component>
    </div>	
</template>
<script>
var default_layouts="panel";
export default {
    computed:{
        layout(){
            console.log(this.$route.meta.layout);
            return (this.$route.meta.layout || default_layouts);
        }
    },
    mounted() {
        /**
         * Generación de BD SQL lite
         */
        db.transaction((tx)=>{
            tx.executeSql('CREATE TABLE IF NOT EXISTS ASISTENCIA(codigo_operador,descripcion,fecha_ref,fundo_id)');
            tx.executeSql('CREATE TABLE IF NOT EXISTS TAREO (codigo_operador,proceso_id,labor_id,area_id,fecha,fundo_id,enviado,cuenta_id)');
            tx.executeSql('CREATE TABLE IF NOT EXISTS AREA (id, nom_area)');
            tx.executeSql('CREATE TABLE IF NOT EXISTS LABOR (id, nom_labor,area_id)');
            tx.executeSql('CREATE TABLE IF NOT EXISTS PROCESO (id, nom_proceso,fundo_id)');
        });

    }
}
</script>