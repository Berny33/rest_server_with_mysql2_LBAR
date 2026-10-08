import { Request, Response } from 'express';
import { pool } from '../conf/dbConnection';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

// Helpers de validación (evitamos que metan letras donde van números)
const isValidId = (id: string) => /^\d+$/.test(id) && parseInt(id, 10) > 0;
const isValidPrice = (price: any) => typeof price === 'number' && price > 0;

export const getAllProducts = async (req: Request, res: Response): Promise<void> => {
    try {
        const [rows] = await pool.query('SELECT * FROM products WHERE active = TRUE');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getProductById = async (req: Request, res: Response): Promise<any> => {
    const id = req.params.id as string;
    if (!isValidId(id)) return res.status(400).json({ error: 'Invalid ID' });

    try {
        const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM products WHERE id = ? AND active = TRUE', [id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Product not found' });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Internal error' });
    }
};

export const createProduct = async (req: Request, res: Response): Promise<any> => {
    const { name, price, stock, description, brand, img } = req.body;
    
    if (!name || price === undefined || stock === undefined || !description) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    if (!isValidPrice(price)) return res.status(400).json({ error: 'Invalid price' });

    try {
        const [result] = await pool.query<ResultSetHeader>(
            'INSERT INTO products (name, price, stock, description, brand, img) VALUES (?, ?, ?, ?, ?, ?)',
            [name, price, stock, description, brand || null, img || null]
        );
        res.status(201).json({ message: 'Product created', id: result.insertId });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create' });
    }
};

export const updateProduct = async (req: Request, res: Response): Promise<any> => {
    const id = req.params.id as string;
    const { name, price, stock, description, brand, img } = req.body;

    if (!isValidId(id)) return res.status(400).json({ error: 'Invalid ID' });
    if (!isValidPrice(price)) return res.status(400).json({ error: 'Invalid price' });

    try {
        const [result] = await pool.query<ResultSetHeader>(
            'UPDATE products SET name=?, price=?, stock=?, description=?, brand=?, img=? WHERE id=? AND active=TRUE',
            [name, price, stock, description, brand || null, img || null, id]
        );
        
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Product not found' });
        res.json({ message: 'Product updated' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update product' });
    }
};

export const deleteProduct = async (req: Request, res: Response): Promise<any> => {
    const id = req.params.id as string;
    if (!isValidId(id)) return res.status(400).json({ error: 'Invalid ID' });

    try {
        const [result] = await pool.query<ResultSetHeader>(
            'UPDATE products SET active=FALSE WHERE id=? AND active=TRUE',
            [id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Product not found' });
        res.json({ message: 'Product deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete product' });
    }
};

export const changeProductPrice = async (req: Request, res: Response): Promise<any> => {
    const id = req.params.id as string;
    const { price } = req.body;

    if (!isValidId(id)) return res.status(400).json({ error: 'Invalid ID' });
    if (!isValidPrice(price)) return res.status(400).json({ error: 'Invalid price' });

    try {
        const [result] = await pool.query<ResultSetHeader>(
            'UPDATE products SET price=? WHERE id=? AND active=TRUE',
            [price, id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Product not found' });
        res.json({ message: 'Product price updated' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update product price' });
    }
};