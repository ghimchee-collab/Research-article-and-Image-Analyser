
import React from 'react';

type ActiveTab = 'article' | 'image';

interface TabsProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export const Tabs: React.FC<TabsProps> = ({ activeTab, setActiveTab }) => {
  const tabClasses = (tabName: ActiveTab) =>
    `px-4 py-2 font-semibold rounded-t-lg transition-colors duration-200 focus:outline-none ${
      activeTab === tabName
        ? 'bg-white text-indigo-600 border-b-2 border-indigo-600'
        : 'text-gray-500 hover:text-indigo-600'
    }`;

  return (
    <div className="border-b border-gray-300">
      <nav className="-mb-px flex space-x-6" aria-label="Tabs">
        <button
          onClick={() => setActiveTab('article')}
          className={tabClasses('article')}
          aria-current={activeTab === 'article' ? 'page' : undefined}
        >
          Article Analyzer
        </button>
        <button
          onClick={() => setActiveTab('image')}
          className={tabClasses('image')}
          aria-current={activeTab === 'image' ? 'page' : undefined}
        >
          Image Analyzer
        </button>
      </nav>
    </div>
  );
};
