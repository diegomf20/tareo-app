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
                    <h5 class="card-title">Enviar Datos</h5>
                 </div>
                 <div class="card-body">
                     <button @click="enviarTareos" class="btn btn-success">Tareo</button>
                     <button @click="enviarMarcador" class="btn btn-success">Marcador</button>
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
export default {
    data() {
        return {
            listaTareo: [],
            listaMarcador: []
        }
    },
    methods: {
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
                        // console.log([respuesta.data].join());
                        db.transaction((tx)=>{
                            tx.executeSql('UPDATE TAREO SET ENVIADO="SI" WHERE rowid in ('+respuesta.data.join()+')',[],function (tx, results) {
                                console.log(results);

                                swal("", respuesta.data.length+" Tareos sincronizados.", "success"); 
                            });
                        });
                    }).catch(function(err) {
                        swal("", 'Error de conexión ' + err, "error");
                    });
                },errorCB);
            });
            
        },
        enviarMarcador(){
            var t=this;
            db.transaction((tx)=>{
                tx.executeSql('SELECT MARCADOR.*,rowid FROM MARCADOR WHERE enviado="NO" AND (salida is NOT NULL OR (salida is NULL AND ingreso<datetime("now","-1 day") ))', [], function (tx, results) {
                    t.listaMarcador=[];
                    for (let i = 0; i < results.rows.length; i++) {
                        t.listaMarcador.push(results.rows.item(i));
                    }
                    axios.post(url_base+'/sincronizar/marcador',{data: t.listaMarcador})
                    .then(response => {
                        var respuesta1=response.data;
                        db.transaction((tx2)=>{
                            var param1=respuesta1.data.join();
                            tx2.executeSql('UPDATE MARCADOR SET ENVIADO="SI" WHERE rowid in ('+param1+')',[],function (tx2, results) {
                                console.log(results);
                                console.log(respuesta1.data.join());
                                
                                swal("", respuesta1.data.length+" datos de Marcador sincronizados.", "success"); 
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
                tx.executeSql('DELETE FROM MARCADOR WHERE enviado="SI" AND ingreso<=datetime("now","-1 day")', [], function (tx, results) {
                    swal("", 'Datos Antiguos Eliminados.', "info");
                },errorCB);
            });    
            db.transaction((tx)=>{
                tx.executeSql('DELETE FROM TAREO WHERE enviado="SI" AND fecha<=datetime("now","-2 day")', [], function (tx, results) {
                    swal("", 'Datos Antiguos Eliminados.', "info");
                },errorCB);
            });    
        }
    },
}
</script>