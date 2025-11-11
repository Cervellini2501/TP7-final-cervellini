# TP 7: Code coverages

Configurar Jest para que genere reportes de coverage
Ver qué partes del código NO están siendo testeadas
Agregar tests donde falten
Llegar al 70% mínimo

Primero configuraros coverage en el backend, para esto modificamos jest.config.js

Opción¿Qué hace?
collectCoverage:true Activa la medición de coverage
collectCoverageFrom Qué archivos analizar
coverageDirectory Dónde guardar los reportes
coverageReporters Formatos del reporte (texto, HTML, JSON)
coverageThreshold Mínimo requerido (70%)

Luego corremos los tests del back con coverage con 
cd backend
npm test -- --coverage

foto coverage en la consola

o tambien lo podemos ver en un reporte de html detallado con 
start coverage/index.html
![alt text](image2.png)

Luego pasamos al front, configuramos el coverage en jest.config.js y corrimos para ver como estaba el porcentaje.
Vimos que en % de funciones estaba abajo del 70% con 5/8 funciones cubiertas.
![alt text](image3.png)

Por lo que implementamos un test mas para cubrir mas codigo y con esto logramos un 75% lo que cubre el minimo solicitado
![alt text](image4.png)

Para terminar con el coverage lo integramos al pipeline de ci/cd. armamos varias etapas 
unit tests + coverage
Verify Coverage Threshold
y repetimos las mismas para el front, enc caso de pasar unit tests y coverage podemos pasar al sig job de buildear front y back

Para la proxima etapa iniciamos sesion en sonarcloud con nuestro usuario de azure y configuramos

En nuestro pipeline de azure antes del build agregamos el endpoint: Prepare Analysis Configuration
Lo configuramos y lo agregamos 

Luego, despues de la tarea del build agregamos el endpoint: Run Code Analysis

Y despues de este el: Publish Quality Gate Result

Cree el archivo de configuracion sonar-project.properties y corri el pipeline. Asi quedaron los resultados del analisis.
![alt text](image5.png)

Seguimos con cypress

Primero instalamos cypress en nuestro proyecto 
 npm install cypress --save-dev

Corremos la interfaz grafica 
npx cypress open

Creamos nuestro primer test de prueba para entender como funciona cypress

Modificamos cypress.config.js con el codigo proporcionado en la guia

Creamos nuestro primer spec con studio
![alt text](image-1.png)

Test de borrar palabra (compara que el lenght de las palabras sea despues)
![alt text](image.png)

test de no borrar si cancelo la confirmacion (compara que el lenght de las palabras sea igual antes y despues)
![alt text](image.png)

test de no agregar si la palabra esta vacia (compara que el lenght de las palabras sea igual antes y despues)

despues de crear todos los tests incluimos la ejecucion de estos luego del deploy a qa