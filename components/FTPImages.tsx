'use client';

import { useEffect, useState } from 'react';
import styles from './FTPImages.module.css';

interface FTPFile {
  name: string;
  type: 'file' | 'directory';
  size: number;
  modifiedAt: string;
  isDirectory: boolean;
  url?: string;
}

interface FTPImagesProps {
  token: string;
  onImageSelect?: (url: string) => void;
}

export default function FTPImages({ token, onImageSelect }: FTPImagesProps) {
  const [images, setImages] = useState<FTPFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentFolder, setCurrentFolder] = useState('');
  const [folderPath, setFolderPath] = useState<string[]>([]);

  useEffect(() => {
    fetchImages();
  }, [currentFolder]);

  const fetchImages = async () => {
    setLoading(true);
    setError(null);

    try {
      const url = `/api/ftp-images${currentFolder ? `?folder=${currentFolder}` : ''}`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch images');
      }

      const data = await response.json();
      setImages(data.images || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch images');
    } finally {
      setLoading(false);
    }
  };

  const handleFolderClick = (folderName: string) => {
    const newFolder = currentFolder ? `${currentFolder}/${folderName}` : folderName;
    setCurrentFolder(newFolder);
    setFolderPath([...folderPath, folderName]);
  };

  const handleBackClick = () => {
    if (folderPath.length > 0) {
      const newPath = folderPath.slice(0, -1);
      setFolderPath(newPath);
      setCurrentFolder(newPath.join('/'));
    }
  };

  const handleImageSelect = (url: string | undefined) => {
    if (url && onImageSelect) {
      onImageSelect(url);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>FTP Images Library</h2>
        <div className={styles.breadcrumb}>
          <button
            onClick={() => {
              setFolderPath([]);
              setCurrentFolder('');
            }}
            className={styles.breadcrumbItem}
          >
            Root
          </button>
          {folderPath.map((folder, index) => (
            <div key={index}>
              <span> / </span>
              <span className={styles.breadcrumbItem}>{folder}</span>
            </div>
          ))}
        </div>
        {folderPath.length > 0 && (
          <button onClick={handleBackClick} className={styles.backButton}>
            ← Back
          </button>
        )}
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {loading ? (
        <div className={styles.loading}>Loading images...</div>
      ) : images.length === 0 ? (
        <div className={styles.empty}>No images found</div>
      ) : (
        <div className={styles.gallery}>
          {images.map((img) => (
            <div
              key={img.name}
              className={`${styles.item} ${img.isDirectory ? styles.folder : styles.image}`}
              onClick={() => {
                if (img.isDirectory) {
                  handleFolderClick(img.name);
                } else {
                  handleImageSelect(img.url);
                }
              }}
            >
              {img.isDirectory ? (
                <div className={styles.folderIcon}>📁 {img.name}</div>
              ) : (
                <>
                  <img src={img.url} alt={img.name} className={styles.thumbnail} />
                  <div className={styles.filename}>{img.name}</div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
