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

// Handle GET requests to fetch all platforms
export async function GET() {
  try {
    console.log('Handling GET request for platforms');
    return new Promise<NextResponse>((resolve, reject) => {
      connection.query('SELECT * FROM platform', (error, results) => {
        if (error) {
          console.error('Database query failed:', error);
          reject(NextResponse.json({ error: 'Database query failed' }, { status: 500 }));
          return;
        }
        console.log('Fetched platforms:', results);
        resolve(NextResponse.json({ platforms: results as Platform[] }));
      });
    });
  } catch (error) {
    console.error('Error handling GET request:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Handle POST requests to insert a new platform and upload files
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const platform_name = formData.get('platform_name') as string;
    const description = formData.get('description') as string;
    const icon = formData.get('icon') as File;
    const cover = formData.get('cover') as File;
    const thumbnail = formData.get('thumbnail') as File;

    if (!platform_name) {
      return NextResponse.json({ error: 'Platform name is required' }, { status: 400 });
    }

    const uploadDirs = {
      icon: path.join(process.cwd(), 'public', 'uploads', 'icons'),
      cover: path.join(process.cwd(), 'public', 'uploads', 'covers'),
      thumbnail: path.join(process.cwd(), 'public', 'uploads', 'site_thumbs'),
    };

    // Ensure the upload directories exist
    await Promise.all(Object.values(uploadDirs).map(async (dir) => {
      if (!fs.existsSync(dir)) {
        await mkdir(dir, { recursive: true });
      }
    }));

    const iconPath = await saveFile(icon, uploadDirs.icon).catch(error => {
      console.error('Error saving icon:', error);
      throw error;
    });
    const coverPath = await saveFile(cover, uploadDirs.cover).catch(error => {
      console.error('Error saving cover:', error);
      throw error;
    });
    const thumbnailPath = await saveFile(thumbnail, uploadDirs.thumbnail).catch(error => {
      console.error('Error saving thumbnail:', error);
      throw error;
    });

    return new Promise<NextResponse>((resolve, reject) => {
      connection.query(
        'INSERT INTO platform (platform_name, description, icon, cover, thumbnail) VALUES (?, ?, ?, ?, ?)',
        [platform_name, description, iconPath, coverPath, thumbnailPath],
        (error) => {
          if (error) {
            console.error('Failed to insert data:', error);
            reject(NextResponse.json({ error: 'Failed to insert data' }, { status: 500 }));
            return;
          }
          resolve(NextResponse.json({ message: 'Platform added successfully' }, { status: 201 }));
        }
      );
    });
  } catch (error) {
    console.error('Error saving files or inserting data:', error);
    return NextResponse.json({ success: false, message: 'Error saving files or inserting data' }, { status: 500 });
  }
}


// Handle PUT requests to update a platform
export async function PUT(request: NextRequest) {
  try {
    const formData = await request.formData();
    const platform_id = formData.get('platform_id') as string;
    const platform_name = formData.get('platform_name') as string;
    const description = formData.get('description') as string;
    const icon = formData.get('icon') as File | null;
    const cover = formData.get('cover') as File | null;
    const thumbnail = formData.get('thumbnail') as File | null;

    if (!platform_id) {
      return NextResponse.json({ error: 'Platform ID is required' }, { status: 400 });
    }

    // Fetch existing file paths from the database
    const platformQuery = 'SELECT icon, cover, thumbnail FROM platform WHERE platform_id = ?';
    const [results] = await new Promise<any[]>((resolve, reject) => {
      connection.query(platformQuery, [platform_id], (error, results) => {
        if (error) {
          console.error('Failed to fetch platform:', error);
          reject(error);
        } else {
          resolve([results, null]);
        }
      });
    });

    if (results.length === 0) {
      return NextResponse.json({ error: 'Platform not found' }, { status: 404 });
    }

    const existingPlatform = results[0];

    const uploadDirs = {
      icon: path.join(process.cwd(), 'public', 'uploads', 'icons'),
      cover: path.join(process.cwd(), 'public', 'uploads', 'covers'),
      thumbnail: path.join(process.cwd(), 'public', 'uploads', 'site_thumbs'),
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

    const iconPath = await handleFileUpdate(icon, existingPlatform.icon, uploadDirs.icon);
    const coverPath = await handleFileUpdate(cover, existingPlatform.cover, uploadDirs.cover);
    const thumbnailPath = await handleFileUpdate(thumbnail, existingPlatform.thumbnail, uploadDirs.thumbnail);

    // Update the platform in the database
    const updateQuery = `
      UPDATE platform 
      SET platform_name = ?, description = ?, icon = ?, cover = ?, thumbnail = ? 
      WHERE platform_id = ?
    `;
    const values = [platform_name, description, iconPath, coverPath, thumbnailPath, platform_id];

    await new Promise<void>((resolve, reject) => {
      connection.query(updateQuery, values, (error) => {
        if (error) {
          console.error('Failed to update platform:', error);
          reject(error);
        } else {
          resolve();
        }
      });
    });

    return NextResponse.json({ message: 'Platform updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error handling PUT request:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Handle DELETE requests to delete a platform
export async function DELETE(request: NextRequest) {
  try {
    const { platform_id } = await request.json();

    if (!platform_id) {
      return NextResponse.json({ error: 'Platform ID is required' }, { status: 400 });
    }

    // Fetch the file paths from the database
    const platformQuery = 'SELECT icon, cover, thumbnail FROM platform WHERE platform_id = ?';
    const platform = await new Promise<any>((resolve, reject) => {
      connection.query(platformQuery, [platform_id], (error, results) => {
        if (error) {
          console.error('Failed to fetch platform:', error);
          reject(new Error('Failed to fetch platform'));
          return;
        }
        if (results.length === 0) {
          resolve(null);
        } else {
          resolve(results[0]);
        }
      });
    });

    if (!platform) {
      return NextResponse.json({ error: 'Platform not found' }, { status: 404 });
    }

    // Delete files from the filesystem
    const uploadDirs = {
      icon: path.join(process.cwd(), 'public', 'uploads', 'icons'),
      cover: path.join(process.cwd(), 'public', 'uploads', 'covers'),
      thumbnail: path.join(process.cwd(), 'public', 'uploads', 'site_thumbs'),
    };

    const filesToDelete = [platform.icon, platform.cover, platform.thumbnail].filter(Boolean);

    await Promise.all(filesToDelete.map(async (filePath: string) => {
      const fullPath = path.join(process.cwd(), 'public', filePath);
      try {
        if (fs.existsSync(fullPath)) {
          await unlink(fullPath);
        }
      } catch (error) {
        console.error('Error deleting file:', error);
      }
    }));

    // Delete the platform from the database
    const deleteQuery = 'DELETE FROM platform WHERE platform_id = ?';
    await new Promise<void>((resolve, reject) => {
      connection.query(deleteQuery, [platform_id], (error) => {
        if (error) {
          console.error('Failed to delete platform:', error);
          reject(new Error('Failed to delete platform'));
          return;
        }
        resolve();
      });
    });

    return NextResponse.json({ message: 'Platform deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error in DELETE request:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

type Platform = {
  platform_id: number;
  platform_name: string;
  description?: string;
  icon?: string;
  cover?: string;
  thumbnail?: string;
};
