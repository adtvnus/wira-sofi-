import React, { useState, useEffect } from 'react';
import { storageManager, StorageQuota } from '../utils/storageManager';

interface StorageWarningProps {
  onBackupCreated?: () => void;
}

// Helper function to get all storage data
const getAllStorageData = async () => {
  const data: Record<string, any> = {};
  const info = storageManager.getStorageInfo();

  try {
    switch (info.storageType) {
      case 'localStorage':
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key) {
            try {
              data[key] = JSON.parse(localStorage.getItem(key) || '');
            } catch {
              data[key] = localStorage.getItem(key);
            }
          }
        }
        break;
      case 'sessionStorage':
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          if (key) {
            try {
              data[key] = JSON.parse(sessionStorage.getItem(key) || '');
            } catch {
              data[key] = sessionStorage.getItem(key);
            }
          }
        }
        break;
      case 'memory':
        // For memory storage, we can't access the private memoryStorage directly
        // So we'll just return a message
        data['note'] = 'Memory storage data cannot be backed up';
        break;
    }
  } catch (error) {
    data['error'] = `Failed to read storage: ${(error as Error).message}`;
  }

  return {
    timestamp: new Date().toISOString(),
    storageType: info.storageType,
    isPrivateMode: info.isPrivateMode,
    data
  };
};

const StorageWarning: React.FC<StorageWarningProps> = ({ onBackupCreated }) => {
  const [storageInfo, setStorageInfo] = useState<{
    quota: StorageQuota | null;
    isPrivateMode: boolean;
    storageType: string;
    showWarning: boolean;
  }>({
    quota: null,
    isPrivateMode: false,
    storageType: 'localStorage',
    showWarning: false
  });

  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [backupMessage, setBackupMessage] = useState('');

  useEffect(() => {
    checkStorageStatus();
    
    // Check storage every 30 seconds
    const interval = setInterval(checkStorageStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const checkStorageStatus = async () => {
    try {
      const quota = await storageManager.getStorageQuota();
      const info = storageManager.getStorageInfo();
      
      const showWarning = Boolean(
        info.isPrivateMode ||
        info.storageType !== 'localStorage' ||
        (quota && quota.percentage > 80)
      );

      setStorageInfo({
        quota,
        isPrivateMode: Boolean(info.isPrivateMode),
        storageType: info.storageType,
        showWarning
      });
    } catch (error) {
      console.warn('Failed to check storage status:', error);
    }
  };

  const handleCreateBackup = async () => {
    setIsCreatingBackup(true);
    setBackupMessage('');

    try {
      // Simple backup by downloading current data
      const allData = await getAllStorageData();
      const dataStr = JSON.stringify(allData, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `wedding-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setBackupMessage('✅ Backup downloaded successfully!');
      onBackupCreated?.();
    } catch (error) {
      setBackupMessage(`❌ Backup failed: ${(error as Error).message}`);
    } finally {
      setIsCreatingBackup(false);

      // Clear message after 5 seconds
      setTimeout(() => setBackupMessage(''), 5000);
    }
  };

  const getWarningLevel = (): 'info' | 'warning' | 'danger' => {
    if (storageInfo.isPrivateMode || storageInfo.storageType === 'memory') {
      return 'danger';
    }
    if (storageInfo.quota && storageInfo.quota.percentage > 90) {
      return 'danger';
    }
    if (storageInfo.quota && storageInfo.quota.percentage > 80) {
      return 'warning';
    }
    return 'info';
  };

  const getWarningIcon = (): string => {
    const level = getWarningLevel();
    switch (level) {
      case 'danger': return 'fas fa-exclamation-triangle';
      case 'warning': return 'fas fa-exclamation-circle';
      default: return 'fas fa-info-circle';
    }
  };

  const getWarningColors = (): string => {
    const level = getWarningLevel();
    switch (level) {
      case 'danger': return 'bg-red-100 border-red-300 text-red-800';
      case 'warning': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      default: return 'bg-blue-100 border-blue-300 text-blue-800';
    }
  };

  if (!storageInfo.showWarning) {
    return null;
  }

  return (
    <div className={`rounded-xl border p-4 mb-6 ${getWarningColors()}`} style={{ fontFamily: 'Ovo, serif' }}>
      <div className="flex items-start space-x-3">
        <i className={`${getWarningIcon()} text-xl mt-1`}></i>
        
        <div className="flex-1">
          <h3 className="font-semibold mb-2">Storage Notice</h3>
          
          <div className="space-y-2 text-sm">
            {storageInfo.isPrivateMode && (
              <p>
                <strong>Private/Incognito Mode Detected:</strong> Your data will be lost when you close this tab. 
                Please create a backup to save your work.
              </p>
            )}
            
            {storageInfo.storageType === 'memory' && (
              <p>
                <strong>Memory Storage Only:</strong> Storage is not available. Your data will be lost on page refresh.
              </p>
            )}
            
            {storageInfo.storageType === 'sessionStorage' && (
              <p>
                <strong>Session Storage:</strong> Your data will be lost when you close this tab.
              </p>
            )}
            
            {storageInfo.quota && storageInfo.quota.percentage > 80 && (
              <p>
                <strong>Storage Almost Full:</strong> You're using {storageInfo.quota.percentage.toFixed(1)}% 
                of available storage ({Math.round(storageInfo.quota.used / 1024)}KB / {Math.round(storageInfo.quota.available / 1024)}KB).
              </p>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={handleCreateBackup}
              disabled={isCreatingBackup}
              className="px-4 py-2 bg-white border border-current rounded-lg hover:bg-opacity-80 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-sm font-medium"
            >
              <i className={`fas ${isCreatingBackup ? 'fa-spinner fa-spin' : 'fa-download'} mr-2`}></i>
              {isCreatingBackup ? 'Creating Backup...' : 'Download Backup'}
            </button>
            
            {storageInfo.quota && storageInfo.quota.percentage > 90 && (
              <button
                onClick={() => {
                  if (confirm('This will clear all stored data. Make sure you have a backup first!')) {
                    storageManager.clear();
                    window.location.reload();
                  }
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 flex items-center text-sm font-medium"
              >
                <i className="fas fa-trash mr-2"></i>
                Clear Storage
              </button>
            )}
          </div>

          {backupMessage && (
            <div className="mt-3 p-2 bg-white bg-opacity-50 rounded-lg text-sm">
              {backupMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StorageWarning;
