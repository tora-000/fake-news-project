import { useState } from 'react';
import { X } from 'lucide-react';
import { Article, ArticleFormData } from '../types';

interface ArticleFormProps {
  article?: Article;
  onClose: () => void;
  onSubmit: (data: ArticleFormData) => void;
}

export const ArticleForm: React.FC<ArticleFormProps> = ({ article, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<ArticleFormData>({
    content: article?.content || '',
    author: article?.author || '',
    source: article?.source || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-neutral/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral hover:text-primary transition-colors"
        >
          <X size={24} />
        </button>
        
        <h2 className="text-2xl font-bree font-bold text-primary mb-6">
          {article ? "Analyze article" : "Analyze a new article"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4 font-din">

          <div>
            <label className="block text-sm font-medium text-neutral mb-1">
              Content
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full p-2 border border-neutral/20 rounded-md focus:border-secondary focus:ring-1 focus:ring-secondary h-32"
              required
              placeholder={`Enter text to analyze\nScore Standards:\nScore > 10: The news is very credible\nScore > 7: The news is highly credible\nScore > 5: The news is moderately credible\nScore ≤ 5: The news is not credible`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral mb-1">
              Author
            </label>
            <input
              type="text"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              className="w-full p-2 border border-neutral/20 rounded-md focus:border-secondary focus:ring-1 focus:ring-secondary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral mb-1">
              Source
            </label>
            <input
              type="text"
              value={formData.source}
              onChange={(e) => setFormData({ ...formData, source: e.target.value })}
              className="w-full p-2 border border-neutral/20 rounded-md focus:border-secondary focus:ring-1 focus:ring-secondary"
              required
            />
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-4 text-neutral hover:text-primary transition-colors"
            >

              <p style={{marginBottom: -10}}>Cancel</p>
            </button>
            <button
              type="submit"
              className="px-4 py-4 bg-secondary text-white rounded-md hover:bg-primary transition-colors"
            >
              <p style={{marginBottom: -10}}>Analyse</p>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};