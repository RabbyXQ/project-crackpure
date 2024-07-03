'use strict';

import { writeFile, mkdir, unlink } from 'fs/promises';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import connection from '../../../../utils/db';

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

// Handle GET requests to fetch all categories
export async function GET() {
  try {
    console.log('Handling GET request for categories');
    const query = 'SELECT * FROM category';
    const results = await new Promise<any[]>((resolve, reject) => {
      connection.query(query, (error, results) => {
        if (error) {
          console.error('Database query failed:', error);
          reject(new Error('Database query failed'));
        } else {
          resolve(results);
        }
      });
    });

    console.log('Fetched categories:', results);
    return NextResponse.json({ categories: results as Category[] });
  } catch (error) {
    console.error('Error handling GET request:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Handle POST requests to insert a new category and upload files
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const platform_id = formData.get('platform_id') as string;
    const type = formData.get('type') as string;
    const cat_name = formData.get('cat_name') as string;
    const cat_description = formData.get('cat_description') as string;
    const icon = formData.get('icon') as File;
    const cat_thumb = formData.get('cat_thumb') as File;
    const cover = formData.get('cover') as File;

    if (!platform_id || !cat_name) {
      return NextResponse.json({ error: 'Platform ID and category name are required' }, { status: 400 });
    }

    const uploadDirs = {
      icon: path.join(process.cwd(), 'public', 'uploads', 'category_icons'),
      cat_thumb: path.join(process.cwd(), 'public', 'uploads', 'category_thumbs'),
      cover: path.join(process.cwd(), 'public', 'uploads', 'category_covers'),
    };

    // Ensure the upload directories exist
    await Promise.all(Object.values(uploadDirs).map(async (dir) => {
      if (!fs.existsSync(dir)) {
        await mkdir(dir, { recursive: true });
      }
    }));

    const iconPath = await saveFile(icon, uploadDirs.icon);
    const catThumbPath = await saveFile(cat_thumb, uploadDirs.cat_thumb);
    const coverPath = await saveFile(cover, uploadDirs.cover);

    const insertQuery = `
      INSERT INTO category (platform_id, type, cat_name, cat_description, icon, cat_thumb, cover) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    await new Promise<void>((resolve, reject) => {
      connection.query(insertQuery, [platform_id, type, cat_name, cat_description, iconPath, catThumbPath, coverPath], (error) => {
        if (error) {
          console.error('Failed to insert data:', error);
          reject(new Error('Failed to insert data'));
        } else {
          resolve();
        }
      });
    });

    return NextResponse.json({ message: 'Category added successfully' }, { status: 201 });
  } catch (error) {
    console.error('Error saving files or inserting data:', error);
    return NextResponse.json({ error: 'Error saving files or inserting data' }, { status: 500 });
  }
}

// Handle PUT requests to update a category
export async function PUT(request: NextRequest) {
  try {
    const formData = await request.formData();
    const cat_id = formData.get('cat_id') as string;
    const type = formData.get('type') as string;
    const platform_id = formData.get('platform_id') as string;
    const cat_name = formData.get('cat_name') as string;
    const cat_description = formData.get('cat_description') as string;
    const icon = formData.get('icon') as File | null;
    const cat_thumb = formData.get('cat_thumb') as File | null;
    const cover = formData.get('cover') as File | null;

    if (!cat_id) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
    }

    // Fetch existing file paths from the database
    const platformQuery = 'SELECT icon, cat_thumb, cover FROM category WHERE cat_id = ?';
    const [results] = await new Promise<any[]>((resolve, reject) => {
      connection.query(platformQuery, [cat_id], (error, results) => {
        if (error) {
          console.error('Failed to fetch category:', error);
          reject(error);
        } else {
          resolve([results, null]);
        }
      });
    });

    if (results.length === 0) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    const existingCategory = results[0];

    const uploadDirs = {
      icon: path.join(process.cwd(), 'public', 'uploads', 'icons'),
      cat_thumb: path.join(process.cwd(), 'public', 'uploads', 'site_thumbs'),
      cover: path.join(process.cwd(), 'public', 'uploads', 'covers'),
    };

    // Ensure the upload directories exist
    await Promise.all(Object.values(uploadDirs).map(async (dir) => {
      if (!fs.existsSync(dir)) {
        await mkdir(dir, { recursive: true });
      }
    }));

    // Manage file updates
    const handleFileUpdate = async (file: File | null, currentPath: string | undefined, dir: string) => {
      if (file) {
        // Delete old file if exists
        if (currentPath && fs.existsSync(path.join(process.cwd(), 'public', currentPath))) {
          await deleteFile(currentPath);
        }

        // Save new file and return new path
        return await saveFile(file, dir).catch(error => {
          console.error('Error saving file:', error);
          throw error;
        });
      }
      return currentPath;
    };

    const iconPath = await handleFileUpdate(icon, existingCategory.icon, uploadDirs.icon);
    const catThumbPath = await handleFileUpdate(cat_thumb, existingCategory.cat_thumb, uploadDirs.cat_thumb);
    const coverPath = await handleFileUpdate(cover, existingCategory.cover, uploadDirs.cover);

    // Update the category in the database
    const updateQuery = `
      UPDATE category 
      SET platform_id = ?, type= ?, cat_name = ?, cat_description = ?, icon = ?, cat_thumb = ?, cover = ? 
      WHERE cat_id = ?
    `;
    const values = [platform_id, type, cat_name, cat_description, iconPath, catThumbPath, coverPath, cat_id];

    await new Promise<void>((resolve, reject) => {
      connection.query(updateQuery, values, (error) => {
        if (error) {
          console.error('Failed to update category:', error);
          reject(error);
        } else {
          resolve();
        }
      });
    });

    return NextResponse.json({ message: 'Category updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error handling PUT request:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}


// Handle DELETE requests to delete a category
export async function DELETE(request: NextRequest) {
    try {
      const { cat_id } = await request.json();
  
      if (!cat_id) {
        return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
      }
  
      // Fetch the file paths from the database
      const fetchQuery = 'SELECT icon, cat_thumb, cover FROM category WHERE cat_id = ?';
      const category = await new Promise<any>((resolve, reject) => {
        connection.query(fetchQuery, [cat_id], (error, results) => {
          if (error) {
            console.error('Failed to fetch category:', error);
            reject(new Error('Failed to fetch category'));
          } else if (results.length === 0) {
            resolve(null);
          } else {
            resolve(results[0]);
          }
        });
      });
  
      if (!category) {
        return NextResponse.json({ error: 'Category not found' }, { status: 404 });
      }
  
      // Delete files from the filesystem
      const uploadDirs = {
        icon: path.join(process.cwd(), 'public', 'uploads', 'category_icons'),
        cat_thumb: path.join(process.cwd(), 'public', 'uploads', 'category_thumbs'),
        cover: path.join(process.cwd(), 'public', 'uploads', 'category_covers'),
      };
  
      const filesToDelete = [category.icon, category.cat_thumb, category.cover].filter(Boolean);
  
      await Promise.all(filesToDelete.map(async (filePath: string) => {
        const fullPath = path.join(process.cwd(), 'public', filePath);
        try {
          if (fs.existsSync(fullPath)) {
            await unlink(fullPath);
            console.log(`Deleted file: ${fullPath}`);
          } else {
            console.warn(`File not found: ${fullPath}`);
          }
        } catch (error) {
          console.error(`Error deleting file ${fullPath}:`, error);
        }
      }));
  
      // Delete the category from the database
      const deleteQuery = 'DELETE FROM category WHERE cat_id = ?';
      await new Promise<void>((resolve, reject) => {
        connection.query(deleteQuery, [cat_id], (error) => {
          if (error) {
            console.error('Failed to delete category:', error);
            reject(new Error('Failed to delete category'));
          } else {
            resolve();
          }
        });
      });
  
      return NextResponse.json({ message: 'Category deleted successfully' }, { status: 200 });
    } catch (error) {
      console.error('Error in DELETE request:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }
  

type Category = {
  cat_id: number;
  type: string;
  platform_id: number;
  cat_name: string;
  cat_description?: string;
  icon?: string;
  cat_thumb?: string;
  cover?: string;
};
