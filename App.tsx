
import React, { useState } from 'react';
import ArticleAnalyzer from './components/ArticleAnalyzer';
import ImageAnalyzer from './components/ImageAnalyzer';
import { Header } from './components/Header';
import { Tabs } from './components/Tabs';

type ActiveTab = 'article' | 'image';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('article');

  return (
    <div className="min-h-screen bg-sky-50 text-gray-800">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="mt-6">
          {activeTab === 'article' && <ArticleAnalyzer />}
          {activeTab === 'image' && <ImageAnalyzer />}
        </div>
      </main>
      <footer className="text-center p-4 text-gray-500 text-sm">
        <p>Powered by Google Gemini. For research and informational purposes only.</p>
      </footer>
    </div>
  );
};

export default App;