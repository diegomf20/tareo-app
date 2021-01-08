<template>
    <div class="row">
        <div class="col-sm-6">
             <div class="card">
                 <div class="card-header">
                    <h5 class="card-title text-center">Recibir Datos</h5>
                 </div>
                 <div class="card-body">
                     <button @click="recibirDatos" class="btn btn-success">Centro de Costos / Actividad / Labor</button>
                 </div>
             </div>
        </div>
        <div class="col-sm-6 col-6">
             <div class="card">
                 <div class="card-header">
                    <h5 class="card-title text-center">Marcas</h5>
                 </div>
                 <div class="card-body text-center">
                    <p>{{ marcas }} sincronizables</p>
                    <button @click="enviarMarcas" class="btn btn-success">Enviar</button>
                 </div>
             </div>
        </div>
        <div class="col-sm-6 col-6">
             <div class="card">
                 <div class="card-header">
                    <h5 class="card-title text-center">Tareos</h5>
                 </div>
                 <div class="card-body text-center">
                    <p>{{ tareos }} sincronizables</p>
                    <button @click="enviarTareos" class="btn btn-success">Enviar</button>
                 </div>
             </div>
        </div>        
    </div>
</template>
<script>
import { mapState,mapMutations } from 'vuex'

export default {
    data() {
        return {
            listaTareo: [],
            listaMarcador: [],
            tareos: 0,
            marcas: 0,
        }
    },
    computed: {
        ...mapState(['cuenta']),
    },
    mounted() {
        this.resumen();
    },
    methods: {
        resumen(){
            var t=this;
            db.transaction((tx)=>{
                tx.executeSql('SELECT COUNT(*) cantidad FROM TAREO', [], function (tx, results) {
                    t.tareos=results.rows.item(0).cantidad
                },errorCB);
            });    
            db.transaction((tx)=>{
                tx.executeSql('SELECT COUNT(*) cantidad FROM MARCAS', [], function (tx, results) {
                    t.marcas=results.rows.item(0).cantidad
                },errorCB);
            });    
        },
        recibirAsistencia(){
            axios.get(url_base+'/sincronizar/asistencia?fecha='+moment().format('YYYY-MM-DD')+'&fundo_id='+this.cuenta.fundo_id)
            .then(response => {
                var asistencias = response.data;
                console.log(asistencias);
                
                /**
                 * Limpiado y Guardado
                 */            
                db.transaction((tx)=>{
                    tx.executeSql('DROP TABLE IF EXISTS ASISTENCIA');
                    tx.executeSql('CREATE TABLE IF NOT EXISTS ASISTENCIA (codigo_operador, fecha_ref,nom_operador,fundo_id)');
                    var i=0;
                    for (i = 0; i < asistencias.length; i++) {
                        var asistencia = asistencias[i];
                        tx.executeSql('INSERT INTO ASISTENCIA(codigo_operador,nom_operador,fecha_ref,fundo_id) VALUES ("'+asistencia.codigo_operador+'","'+asistencia.nom_operador+'","'+asistencia.fecha_ref+'","'+asistencia.fundo_id+'")'); 
                    }
                    swal("","Asistencia Sincronizada" , 'info');
                }, errorCB, successCB);
            }).catch(function(err) {
                swal("", 'Error de conexión ' + err, "error");
            });
        },
        recibirDatos(){
            axios.get(url_base+'/area/labor')
            .then(response => {
                /**
                 * Datos recibidos
                 */
                var areas = response.data;
                /**
                 * Limpiado y Guardado
                 */            
                db.transaction((tx)=>{
                    tx.executeSql('DROP TABLE IF EXISTS AREA');
                    tx.executeSql('DROP TABLE IF EXISTS LABOR');
                    tx.executeSql('CREATE TABLE IF NOT EXISTS AREA (id, nom_area)');
                    tx.executeSql('CREATE TABLE IF NOT EXISTS LABOR (id, nom_labor,area_id)');
                    var i=0;
                    for (i = 0; i < areas.length; i++) {
                        var area = areas[i];
                        tx.executeSql('INSERT INTO AREA (id, nom_area) VALUES ("'+area.id+'","'+area.nom_area+'")'); 
                        for (let j = 0; j < area.labores.length; j++) {
                            var labor = area.labores[j];
                            tx.executeSql('INSERT INTO LABOR (id, nom_labor,area_id) VALUES ("'+labor.id+'","'+labor.nom_labor+'","'+labor.area_id+'")'); 
                        }
                    }
                    swal("",(i)+" Areas encontradas" , 'info');
                }, errorCB, successCB);
            }).catch(function(err) {
                swal("", 'Error de conexión ' + err, "error");
            });
            axios.get(url_base+'/proceso?all=true')
            .then(response => {
                /**
                 * Datos recibidos
                 */
                var ccostos = response.data;
                /**
                 * Limpiado y Guardado
                 */            
                db.transaction((tx)=>{
                    tx.executeSql('DROP TABLE IF EXISTS PROCESO');
                    tx.executeSql('CREATE TABLE IF NOT EXISTS PROCESO (id, nom_proceso,fundo_id)');
                    var k=0;
                    for (k = 0; k < ccostos.length; k++) {
                        var ccsoto = ccostos[k];
                        tx.executeSql('INSERT INTO PROCESO (id, nom_proceso,fundo_id) VALUES ("'+ccsoto.id+'","'+ccsoto.nom_proceso+'","'+ccsoto.fundo_id+'")'); 
                    }
                    swal("",(k)+" Centros Costos encontrados" , 'info');
                }, errorCB, successCB);
            }).catch(function(err) {
                swal("", 'Error de conexión ' + err, "error");
            });
        },
        enviarTareos(){
            var t=this;
            db.transaction((tx)=>{
                tx.executeSql('SELECT TAREO.*,rowid FROM TAREO WHERE enviado="NO"', [], function (tx, results) {
                    axios.post(url_base+'/sincronizar/tareo',{data: results.rows})
                    .then(response => {
                        var respuesta=response.data;
                        if (respuesta.status=="OK") {
                            db.transaction((tx)=>{
                                tx.executeSql('DELETE FROM TAREO');
                                swal({
                                    text: "TAREO SINCRONIZADO",
                                    icon: "success",
                                });
                                t.resumen();
                            });
                        }
                    }).catch(function(err) {
                        swal("", 'Error de conexión ' + err, "error");
                    });
                },errorCB);
            });
            
        },
        enviarMarcas(){
            var t=this;
            db.transaction((tx)=>{
                tx.executeSql('SELECT *,rowid FROM MARCAS', [], function (tx, results) {
                    // console.log(results.rows);
                    axios.post(url_base+'/sincronizar/in/marcas',{data: results.rows})
                    .then(response => {
                        var res=response.data;
                        if (res.status=='OK') {
                            db.transaction((tx)=>{
                                tx.executeSql('DELETE FROM MARCAS');
                                swal({
                                    text: "MARCADOR SINCRONIZADO",
                                    icon: "success",
                                });
                                t.resumen();
                            });  
                        }
                    });
                });
            });
        }
    },
}
</script>