'use strict';

import { writeFile, mkdir } from 'fs/promises';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

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

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const icon = data.get('icon');
    const cover = data.get('cover');
    const thumbnail = data.get('thumbnail');

    console.log('icon:', icon ? icon.name : 'No icon');
    console.log('cover:', cover ? cover.name : 'No cover');
    console.log('thumbnail:', thumbnail ? thumbnail.name : 'No thumbnail');

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

    const iconPath = await saveFile(icon as File, uploadDirs.icon).catch(error => {
      console.error('Error saving icon:', error);
      throw error;
    });
    const coverPath = await saveFile(cover as File, uploadDirs.cover).catch(error => {
      console.error('Error saving cover:', error);
      throw error;
    });
    const thumbnailPath = await saveFile(thumbnail as File, uploadDirs.thumbnail).catch(error => {
      console.error('Error saving thumbnail:', error);
      throw error;
    });

    const filePaths = {
      icon: iconPath,
      cover: coverPath,
      thumbnail: thumbnailPath
    };

    console.log('filePaths:', filePaths);

    return NextResponse.json({ success: true, filepaths: filePaths });
  } catch (error) {
    console.error('Error saving files:', error);
    return NextResponse.json({ success: false, message: 'Error saving files' }, { status: 500 });
  }
}
