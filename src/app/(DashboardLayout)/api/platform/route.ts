'use strict';

import { writeFile, mkdir } from 'fs/promises';
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
export async function PUT(request: Request) {
  try {
    const { platform_id, platform_name, description } = await request.json();

    if (!platform_id) {
      return NextResponse.json({ error: 'Platform ID is required' }, { status: 400 });
    }

    const query = 'UPDATE platform SET platform_name = ?, description = ? WHERE platform_id = ?';
    const values = [platform_name, description, platform_id];

    return new Promise<NextResponse>((resolve, reject) => {
      connection.query(query, values, (error) => {
        if (error) {
          console.error('Failed to update data:', error);
          reject(NextResponse.json({ error: 'Failed to update data' }, { status: 500 }));
          return;
        }
        resolve(NextResponse.json({ message: 'Platform updated successfully' }, { status: 200 }));
      });
    });
  } catch (error) {
    console.error('Error in PUT request:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Handle DELETE requests to delete a platform
export async function DELETE(request: Request) {
  try {
    const { platform_id } = await request.json();

    if (!platform_id) {
      return NextResponse.json({ error: 'Platform ID is required' }, { status: 400 });
    }

    const query = 'DELETE FROM platform WHERE platform_id = ?';

    return new Promise<NextResponse>((resolve, reject) => {
      connection.query(query, [platform_id], (error) => {
        if (error) {
          console.error('Failed to delete data:', error);
          reject(NextResponse.json({ error: 'Failed to delete data' }, { status: 500 }));
          return;
        }
        resolve(NextResponse.json({ message: 'Platform deleted successfully' }, { status: 200 }));
      });
    });
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
