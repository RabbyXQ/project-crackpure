'use strict';

import { NextApiRequest, NextApiResponse } from 'next';
import connection from '../../../../utils/db';
import { writeFile, mkdir, unlink } from 'fs/promises';
import path from 'path';
import fs from 'fs';

// Function to fetch category details by ID
const getCategoryById = async (cat_id: string) => {
  try {
    const [rows] = await connection.execute('SELECT * FROM category WHERE cat_id = ?', [cat_id]);
    return rows[0] || null;
  } catch (error) {
    console.error('Error fetching category:', error);
    throw error;
  }
};

// Function to sanitize file names
const sanitizeFileName = (fileName: string): string => {
  return fileName
    .replace(/[\s]/g, '_')       // Replace spaces with underscores
    .replace(/[^a-zA-Z0-9._-]/g, '') // Remove special characters except dots, underscores, and hyphens
    .replace(/_+/g, '_');        // Replace multiple underscores with a single underscore
};

// Function to generate a unique file name with a timestamp
const getUniqueFileName = (fileName: string): string => {
  const timestamp = new Date().toISOString().replace(/[-:.]/g, ''); // Remove special characters from timestamp
  const ext = path.extname(fileName);
  const baseName = path.basename(fileName, ext);
  return `${baseName}_${timestamp}${ext}`;
};

// Function to save a file
const saveFile = async (file: File, dir: string) => {
  if (!file || !(file instanceof Blob)) {
    return null;
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const originalFileName = file.name;
  const safeFileName = sanitizeFileName(originalFileName);
  const uniqueFileName = getUniqueFileName(safeFileName);
  const filePath = path.join(dir, uniqueFileName);

  await writeFile(filePath, buffer);
  return `/uploads/${path.basename(dir)}/${uniqueFileName}`;
};

// Function to delete a file
const deleteFile = async (filePath: string | undefined) => {
  if (filePath) {
    const fullPath = path.join(process.cwd(), 'public', filePath);
    try {
      if (fs.existsSync(fullPath)) {
        await unlink(fullPath);
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  }
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method === 'POST') {
      const formData = await req.formData();
      const upload_date = formData.get('upload_date') as string;
      const platform_id = formData.get('platform_id') as string;
      const cat_id = formData.get('cat_id') as string;
      const package_name = formData.get('package_name') as string;
      const name = formData.get('name') as string;
      const description = formData.get('description') as string;
      const vendor = formData.get('vendor') as string;
      const version = formData.get('version') as string;
      const release_date = formData.get('release_date') as string;

      if (!upload_date || !platform_id || !cat_id || !package_name || !name || !description || !vendor || !version || !release_date) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Fetch category name
      const category = await getCategoryById(cat_id);
      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }
      const cat_name = category.cat_name;

      const uploadDir = path.join(process.cwd(), 'public', 'uploads', cat_name);
      const thumbDir = path.join(process.cwd(), 'public', 'uploads', cat_name, 'soft_thumbs');

      // Ensure the upload directories exist
      await Promise.all([uploadDir, thumbDir].map(async (dir) => {
        if (!fs.existsSync(dir)) {
          await mkdir(dir, { recursive: true });
        }
      }));

      // Save files
      const uploadFile = formData.get('upload') as File;
      const uploadFilePath = await saveFile(uploadFile, uploadDir);

      const thumbFile = formData.get('thumbnail') as File;
      const thumbFilePath = await saveFile(thumbFile, thumbDir);

      // Insert into the database
      const [result] = await connection.execute(`
        INSERT INTO upload (upload_date, path) VALUES (?, ?)
      `, [upload_date, uploadFilePath]);

      const upload_id = (result as any).insertId;

      await connection.execute(`
        INSERT INTO software (upload_id, platform_id, cat_id, package_name, name, description, vendor, version, release_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [upload_id, platform_id, cat_id, package_name, name, description, vendor, version, release_date]);

      await connection.execute(`
        INSERT INTO soft_thumb (link, software_id)
        VALUES (?, ?)
      `, [thumbFilePath, upload_id]);

      res.status(201).json({ message: 'Data inserted successfully' });
    } else {
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error executing query:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export default handler;
