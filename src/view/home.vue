<template>
    <div class="row">
        <div class="col-12">
            <h4>Resumen de Tareo</h4>
        </div>
        <div class="col-6">
            <div class="card">
                <div class="card-header">
                    <h6>Asistencias Hoy</h6>
                </div>
                <div class="card-body">
                    <h4>{{ count_asistencia }}</h4>
                </div>
            </div>
        </div>
        <div class="col-6">
            <div class="card">
                <div class="card-header">
                    <h6>Total Datos</h6>
                </div>
                <div class="card-body">
                    <h4>{{ count_total }}</h4>
                </div>
            </div>
        </div>
        <div class="col-6">
            <div class="card">
                <div class="card-header">
                    <h6>Sincronizables</h6>
                </div>
                <div class="card-body">
                    <h4>{{ count_enviar }}</h4>
                </div>
            </div>
        </div>
        <div class="col-6">
            <div class="card">
                <div class="card-header">
                    <h6>Enviados</h6>
                </div>
                <div class="card-body">
                    <h4>{{ count_total-count_enviar-count_antiguo }}</h4>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
export default {
    data() {
        return {
            count_antiguo: 0,
            count_enviar: 0,
            count_total: 0,
            count_asistencia: 0
        }
    },
    mounted() {
        this.antiguos();
        this.total();
        this.enviables();
        this.asistencia();
    },
    methods: {
        asistencia(){
            var t=this;
            db.transaction((tx)=>{
                tx.executeSql('SELECT COUNT(*) cantidad FROM ASISTENCIA', [], function (tx, results) {
                    t.count_asistencia=results.rows.item(0).cantidad
                },errorCB);
            });    
        },
        total(){
            var t=this;
            db.transaction((tx)=>{
                tx.executeSql('SELECT COUNT(*) cantidad FROM TAREO', [], function (tx, results) {
                    t.count_total=results.rows.item(0).cantidad
                },errorCB);
            });    
        },
        antiguos(){
            var t=this;
            db.transaction((tx)=>{
                tx.executeSql('SELECT COUNT(*) cantidad FROM TAREO WHERE enviado="SI" AND fecha!="'+moment().format('YYYY-MM-DD')+'"', [], function (tx, results) {
                    t.count_antiguo=results.rows.item(0).cantidad
                },errorCB);
            });    
        },
        enviables(){
            var t=this;
            db.transaction((tx)=>{
                tx.executeSql('SELECT COUNT(*) cantidad FROM TAREO WHERE enviado="NO" AND fecha="'+moment().format('YYYY-MM-DD')+'"', [], function (tx, results) {
                    t.count_enviar=results.rows.item(0).cantidad
                },errorCB);
            });    
        },
    },
}
</script>