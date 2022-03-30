# TAREO APP

## Pre Requisitos.

* tener instalado Node js
* Instalar apache cordoba de manera grupal
```
npm install -g cordova
```

* Tener instalado JDK 8, gradle-2.0-all (dejo copia en el USB) y ANDROID STUDIO.
* Declarar como variables de entorno JAVA HOME, ANDROID_SDK, GRADLED 


## Instalar Librerias
```
npm install
```

## Correr en entorno de desarrollo
```
npm run paso
```
* Usar un web server (Web Server for Chrome) apuntando a wwww para visualizar el formato Web del Aplicativo.

## PASE A PRODUCCION

### (Build) Compilar vistas
```
npm run prod
```

### Generar APK
<p>Usar ANDROID STUDIO PARA COMPILAR.</p>
<p>Usar plugin cordova en ANDROID STUDIO.</p>
<p>El apk sera generado /plataforms/android/app/build/outputs/apk/debug/app-debug.apk</p>
<p>Cambiar nombre a lo deseado.</p>