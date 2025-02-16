import React from 'react';
import { Article } from '../types';

interface FloatingArticleProps {
  article: Article;
  onClick: (article: Article) => void;
  style: React.CSSProperties;
}

export const FloatingArticle: React.FC<FloatingArticleProps> = ({ article, onClick, style }) => {
  return (
    <div
      className="absolute cursor-pointer transition-transform duration-300 hover:scale-105 hover:z-50"
      style={style}
      onClick={() => onClick(article)}
    >
      <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-sm hover:shadow-xl">
        <img
          src={article.imageUrl}
          alt={article.title}
          className="w-full h-32 object-cover"
        />
        <div className="p-4">
          <h3 className="text-lg font-bree font-semibold text-primary mb-2 line-clamp-2">{article.title}</h3>
          <p className="text-sm text-neutral font-din">Par {article.author}</p>
        </div>
      </div>
    </div>
  );
};