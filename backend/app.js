const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.json({ 
        message: 'API de To-Do List funcionando',
        endpoints: {
            GET: '/api/tareas - Obtener todas las tareas',
            POST: '/api/tareas - Crear nueva tarea',
            PUT: '/api/tareas/:id - Actualizar tarea',
            DELETE: '/api/tareas/:id - Eliminar tarea'
        }
    });
});

const tareasRoutes = require('./routes/tareas.routes');
app.use('/api/tareas', tareasRoutes);

app.use((req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});