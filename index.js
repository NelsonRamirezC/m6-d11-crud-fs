import express from 'express';
import fs from 'node:fs/promises';
import {v4 as uuid} from 'uuid';

import * as path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

app.listen(3000, () => {
    console.log("servidor escuchando en http://localhost:3000")
});

//MIDDLEWARES PARA PROCESAR DATOS DESDE EL CLIENTE AL SERVIDOR

app.use(express.json()); //los guarda en req.body

//públicar la carpeta public
app.use(express.static("public"));

//ruta que devuelva la página principal

app.get(["/", "/home", "/inicio"], (req, res) => {
    res.sendFile(path.join(__dirname, "/public/index.html"));
});


//ENDPOINTS PARA EL CRUD -> LISTA DE CANCIONES (SPOTIFY)

app.get("/canciones", async(req, res) => {
    try {
        let cancionesJson = await fs.readFile(path.join(__dirname, "/listas/canciones.json"), "utf-8");

        res.json({
            code: 200, 
            lista: JSON.parse(cancionesJson).lista,
            message: "Todo ok"
        });
    }catch(error){
        res.status(500).json({
            code: 500,
            message: "Error al intentar leer la lista de canciones."
        })
    }
});

//ENDPOINT QUE PERMITE AGREGAR NUEVAS CANCIONES

app.post("/canciones", async(req, res) => {
    try {

      let {nombre} = req.body;

        let nuevaCancion = {
            id: uuid().slice(0,6),
            nombre
        }
        let cancionesJson = await fs.readFile(path.join(__dirname, "/listas/canciones.json"), "utf-8");

        let listaCanciones = JSON.parse(cancionesJson);

        listaCanciones.lista.push(nuevaCancion);

        await fs.writeFile(path.join(__dirname, "/listas/canciones.json"), JSON.stringify(listaCanciones, null, 4), "utf-8");

        
        res.json({
            code: 201,
            lista: listaCanciones.lista,
            message: "Todo ok"
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            code: 500,
            message: "Error al intentar agregar la nueva canción."
        });
    }
});


app.delete("/canciones", async (req, res) => {
    try {
        let { id } = req.query;

        let cancionesJson = await fs.readFile(path.join(__dirname, "/listas/canciones.json"), "utf-8");

        let listaCanciones = JSON.parse(cancionesJson);

        let indiceCancion = listaCanciones.lista.findIndex(cancion => cancion.id == id);

        if(indiceCancion >=0){
          
           listaCanciones.lista.splice(indiceCancion, 1);

           await fs.writeFile(path.join(__dirname, "/listas/canciones.json"), JSON.stringify(listaCanciones, null, 4), "utf-8");

            res.json({
                code: 200,
                message: "Todo ok desde método delete",
                lista: listaCanciones.lista
            })
        }else {
            res.status(404).json({
                code: 404,
                message: "No existe la canción que desea eliminar - ID: " + id 
            })
        }
    } catch (error) {
        res.status(500).json({
            code: 500,
            message: "Error al intentar eliminar la canción"
        })
    }
})



//ENDPOINT PARA ACTUALIZAR CANCIONES

app.put("/canciones", async(req, res) => {
    try {

      let {id, nombre} = req.body;

        let cancionesJson = await fs.readFile(path.join(__dirname, "/listas/canciones.json"), "utf-8");

        let listaCanciones = JSON.parse(cancionesJson);

        let cancionFound = listaCanciones.lista.find(cancion => cancion.id == id);


        if(cancionFound){

            cancionFound.nombre = nombre;

            await fs.writeFile(path.join(__dirname, "/listas/canciones.json"), JSON.stringify(listaCanciones, null, 4), "utf-8");

        
            res.json({
                code: 201,
                lista: listaCanciones.lista,
                message: "Todo ok"
            })

        }else {
            res.status(404).json({
                code: 404,
                message: "No existe la canción que desea actualizar - ID: " + id 
            })
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            code: 500,
            message: "Error al intentar agregar la nueva canción."
        });
    }
});

