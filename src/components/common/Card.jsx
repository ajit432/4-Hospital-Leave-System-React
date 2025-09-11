import React from 'react';
import clsx from 'clsx';

const Card = ({ children, className = '', padding = true }) => {
  return (
    <div className={clsx('card', padding && 'p-6', className)}>
      {children}
    </div>
  );
};

const CardHeader = ({ children, className = '' }) => {
  return (
    <div className={clsx('border-b border-gray-200 dark:border-gray-700 pb-4 mb-4', className)}>
      {children}
    </div>
  );
};

const CardTitle = ({ children, className = '' }) => {
  return (
    <h3 className={clsx('text-lg font-semibold text-gray-900 dark:text-gray-100', className)}>
      {children}
    </h3>
  );
};

const CardContent = ({ children, className = '' }) => {
  return (
    <div className={clsx(className)}>
      {children}
    </div>
  );
};

Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Content = CardContent;

export default Card;
