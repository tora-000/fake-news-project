export interface Article {
  id: string;
  title: string;
  content: string;
  author: string;
  source: string;
  imageUrl: string;
}

export interface ArticleFormData {
  content: string;
  author: string;
  source: string;
}