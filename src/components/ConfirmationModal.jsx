import React from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import Button from './common/Button';

const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Confirm', 
  cancelText = 'Cancel',
  type = 'warning' // warning, danger, info
}) => {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          iconBg: 'bg-red-100 dark:bg-red-900/30',
          iconColor: 'text-red-600 dark:text-red-400',
          buttonVariant: 'danger'
        };
      case 'info':
        return {
          iconBg: 'bg-blue-100 dark:bg-blue-900/30',
          iconColor: 'text-blue-600 dark:text-blue-400',
          buttonVariant: 'primary'
        };
      default:
        return {
          iconBg: 'bg-yellow-100 dark:bg-yellow-900/30',
          iconColor: 'text-yellow-600 dark:text-yellow-400',
          buttonVariant: 'warning'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className={`flex-shrink-0 w-10 h-10 ${styles.iconBg} rounded-full flex items-center justify-center mr-4`}>
              <ExclamationTriangleIcon className={`w-6 h-6 ${styles.iconColor}`} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {title}
              </h3>
            </div>
          </div>
          
          <div className="mb-6">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {message}
            </p>
          </div>

          <div className="flex space-x-3 justify-end">
            <Button
              variant="outline"
              onClick={onClose}
            >
              {cancelText}
            </Button>
            <Button
              variant={styles.buttonVariant}
              onClick={onConfirm}
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
