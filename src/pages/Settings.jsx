import React from 'react';
import Card from '../components/common/Card';
import { useTheme } from '../contexts/ThemeContext';

const Settings = () => {
  const { theme, setTheme } = useTheme();

  const handleThemeChange = (selectedTheme) => {
    setTheme(selectedTheme);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Manage your account settings and preferences
        </p>
      </div>

      <Card>
        <Card.Header>
          <Card.Title>Appearance</Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Theme</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Choose your preferred theme for the application
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Light Theme Option */}
                <div
                  className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all duration-200 ${
                    theme === 'light'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                  }`}
                  onClick={() => handleThemeChange('light')}
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-6 h-6 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center">
                        <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Light</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Bright and clean interface</p>
                    </div>
                    {theme === 'light' && (
                      <div className="absolute top-2 right-2">
                        <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Dark Theme Option */}
                <div
                  className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all duration-200 ${
                    theme === 'dark'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                  }`}
                  onClick={() => handleThemeChange('dark')}
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-6 h-6 bg-gray-800 border-2 border-gray-600 rounded-full flex items-center justify-center">
                        <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Dark</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Easy on the eyes</p>
                    </div>
                    {theme === 'dark' && (
                      <div className="absolute top-2 right-2">
                        <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card.Content>
      </Card>

      <Card>
        <Card.Header>
          <Card.Title>Account Settings</Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">⚙️</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">More Settings Coming Soon</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Additional settings and preferences will be available here.
            </p>
          </div>
        </Card.Content>
      </Card>
    </div>
  );
};

export default Settings;
