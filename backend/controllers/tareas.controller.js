const db = require('../config/db');


exports.obtenerTodas = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM tareas ORDER BY fecha_creacion DESC');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener tareas' });
    }
};


exports.obtenerPorId = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM tareas WHERE id = ?', [req.params.id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Tarea no encontrada' });
        }
        
        res.json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener tarea' });
    }
};


exports.crear = async (req, res) => {
    try {
        const { titulo } = req.body;
        
        if (!titulo) {
            return res.status(400).json({ error: 'El título es requerido' });
        }
        
        const [result] = await db.query(
            'INSERT INTO tareas (titulo) VALUES (?)',
            [titulo]
        );
        
        const [nuevaTarea] = await db.query('SELECT * FROM tareas WHERE id = ?', [result.insertId]);
        
        res.status(201).json(nuevaTarea[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear tarea' });
    }
};


exports.actualizar = async (req, res) => {
    try {
        const { id } = req.params;
        const { titulo, completada } = req.body;
        
        
        let query = 'UPDATE tareas SET ';
        const values = [];
        
        if (titulo !== undefined) {
            query += 'titulo = ?, ';
            values.push(titulo);
        }
        
        if (completada !== undefined) {
            query += 'completada = ?, ';
            values.push(completada);
        }
        
        
        query = query.slice(0, -2);
        query += ' WHERE id = ?';
        values.push(id);
        
        const [result] = await db.query(query, values);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Tarea no encontrada' });
        }
        
        
        const [tareaActualizada] = await db.query('SELECT * FROM tareas WHERE id = ?', [id]);
        res.json(tareaActualizada[0]);
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar tarea' });
    }
};


exports.eliminar = async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM tareas WHERE id = ?', [req.params.id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Tarea no encontrada' });
        }
        
        res.json({ mensaje: 'Tarea eliminada correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar tarea' });
    }
};