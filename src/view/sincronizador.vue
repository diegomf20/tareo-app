<template>
    <div class="row">
        <div class="col-sm-6">
             <div class="card">
                 <div class="card-header">
                    <h5 class="card-title">Recibir Datos</h5>
                 </div>
                 <div class="card-body">
                     <button @click="recibirDatos" class="btn btn-success">Centro de Costos / Actividad / Labor</button>
                 </div>
             </div>
        </div>
        <div class="col-sm-6">
             <div class="card">
                 <div class="card-header">
                    <h5 class="card-title">Recibir Asistencia</h5>
                 </div>
                 <div class="card-body">
                     <button @click="recibirAsistencia" class="btn btn-success">Asistencias</button>
                 </div>
             </div>
        </div>
        <div class="col-sm-6">
             <div class="card">
                 <div class="card-header">
                    <h5 class="card-title">Enviar Datos</h5>
                 </div>
                 <div class="card-body">
                    <button @click="enviarTareos" class="btn btn-success">Tareo</button>
                 </div>
             </div>
        </div>
        <div class="col-sm-6">
            <div class="card">
                <div class="card-header">
                    <h5 class="card-title">Limpiar Datos</h5>
                </div>
                <div class="card-body">
                    <button @click="limpiar" class="btn btn-success">Datos ya enviados</button>
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
            listaMarcador: []
        }
    },
    computed: {
        ...mapState(['cuenta']),
    },
    methods: {
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
                    t.listaTareo=[];
                    for (let i = 0; i < results.rows.length; i++) {
                        t.listaTareo.push(results.rows.item(i));
                    }
                    axios.post(url_base+'/sincronizar/tareo',{data: t.listaTareo})
                    .then(response => {
                        var respuesta=response.data;
                        db.transaction((tx)=>{
                            tx.executeSql('UPDATE TAREO SET ENVIADO="SI" WHERE rowid in ('+respuesta.data.join()+')',[],function (tx, results) {
                                swal("", respuesta.data.length+" Tareos sincronizados.", "success"); 
                            });
                        });
                    }).catch(function(err) {
                        swal("", 'Error de conexión ' + err, "error");
                    });
                },errorCB);
            });
            
        },
        limpiar(){
            db.transaction((tx)=>{
                tx.executeSql('DELETE FROM TAREO WHERE enviado="SI" AND fecha<=datetime("now","-2 day")', [], function (tx, results) {
                    swal("", 'Datos Antiguos Eliminados.', "info");
                },errorCB);
            });    
        }
    },
}
</script>