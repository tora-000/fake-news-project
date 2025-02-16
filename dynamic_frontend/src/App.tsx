import React, { useState, useEffect } from 'react';
import { Newspaper, Plus } from 'lucide-react';
import { Article, ArticleFormData } from './types';
import { FloatingArticle } from './components/FloatingArticle';
import { ArticleForm } from './components/ArticleForm';
import articlesData from './data/articles.json';
import axios from 'axios';
import {ArticleFormResult} from "./components/ArticleFormResult.tsx";

interface AnalyseResponse {
  credibility_score: number;
  visualization_url: string;
}

function App() {
  const [articles] = useState<Article[]>(articlesData.articles);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [positions, setPositions] = useState<React.CSSProperties[]>([]);
  const [showFormResult, setShowFormResult] = useState(false);
  const [responseData, setResponseData] = useState<AnalyseResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const generatePositions = () => {
      const columns = 3;
      const rows = 3;
      
      return articles.map((_, index) => {

        const column = index % columns;
        const row = Math.floor(index / columns) % rows;
        
        const randomOffsetX = (Math.random() - 0.5) * 10;
        const randomOffsetY = (Math.random() - 0.5) * 10;
        
        const baseTop = (row * 33) + randomOffsetY;
        const left = ((column / (columns - 1)) * 80) + randomOffsetX;
        
        const path = Math.random() > 0.5 ? 1 : -1;
        
        return {
          top: `${Math.min(Math.max(baseTop, 5), 75)}%`,
          left: `${Math.min(Math.max(left, 5), 85)}%`,
          animation: `float-${path > 0 ? 'right' : 'left'} ${Math.random() * 10 + 20}s linear infinite`,
          transform: 'translate(-50%, -50%)',
        };
      });
    };

    setPositions(generatePositions());

    const interval = setInterval(() => {
      setPositions(generatePositions());
    }, 20000);

    return () => clearInterval(interval);
  }, [articles]);

  const handleArticleClick = (article: Article) => {
    setSelectedArticle(article);
    setShowForm(true);
  };

  const handleNewArticle = () => {
    setSelectedArticle(null);
    setShowForm(true);
  };

  const handleSubmit = (data: ArticleFormData) => {
    setLoading(true);

    axios.post('http://localhost:4500/analyze', {
      text: data.content,
      author: data.author,
      source: data.source,
    }).then(
      response => {
        const responseData: AnalyseResponse = response.data;
        setResponseData(responseData);
      }
    ).catch(
    );

    setShowForm(false);
    setLoading(false);
    setShowFormResult(true);
  };

  return (
    <div className="min-h-screen bg-neutral/5">
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Newspaper className="h-8 w-8 text-secondary"/>
              <h1 className="text-2xl font-bree font-bold text-primary">Fake sports news detector</h1>
            </div>
            <button
              onClick={handleNewArticle}
              className="flex items-center space-x-2 px-4 py-2 bg-secondary text-white rounded-md hover:bg-primary transition-colors font-din"
            >
              <Plus className="h-5 w-5"/>
              <p className="text-sm align-middle flex items-center" style={{marginBottom: -10}}>
                Analyse an article
              </p>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="relative h-[calc(100vh-12rem)] overflow-hidden">
          {articles.map((article, index) => (
            <FloatingArticle
              key={article.id}
              article={article}
              onClick={handleArticleClick}
              style={positions[index]}
            />
          ))}
        </div>
      </main>

      {showForm && (
        <ArticleForm
          article={selectedArticle || undefined}
          onClose={() => setShowForm(false)}
          onSubmit={handleSubmit}
        />
      )}

      {showFormResult && (
        <ArticleFormResult
          onClose={() => setShowFormResult(false)}
          credibility_score={responseData?.credibility_score || 0}
          visualization_url={responseData?.visualization_url || ""}
          loading={loading}
        />
      )}
    </div>
  );
}

export default App;