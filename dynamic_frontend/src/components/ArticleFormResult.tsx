import React, {useEffect, useState} from 'react';
import {X} from 'lucide-react';
import axios from "axios";

interface ArticleFormResultProps {
  credibility_score: number;
  visualization_url: string;
  onClose: () => void;
  loading: boolean;
}

const getCredibilityMessage = (score: number): string => {
  if (score > 10) {
    return "The news is very credible";
  } else if (score > 7) {
    return "The news is highly credible";
  } else if (score > 5) {
    return "The news is moderately credible";
  } else {
    return "The news is not credible";
  }
};

export const ArticleFormResult: React.FC<ArticleFormResultProps> = ({
                                                                      credibility_score,
                                                                      onClose,
                                                                      visualization_url,
                                                                      loading,
                                                                    }) => {

  const [htmlPage, setHtmlPage] = useState<string | null>(null);

  const handleGetVisualization = (url: string) => {
    axios.get(`http://localhost:4500${url}`).then(
      response => {
        setHtmlPage(response.data);
      }
    ).catch(
    );
  }

  useEffect(() => {
    if (loading) {
      return;
    }
    handleGetVisualization(visualization_url);
  }, [visualization_url, loading]);

  return (
    <div className="fixed inset-0 bg-neutral/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl p-6 relative h-full">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral hover:text-primary transition-colors"
        >
          <X size={24}/>
        </button>

        <h2 className="text-2xl font-bree font-bold text-primary mb-6">
          Article analysis result
        </h2>

        {loading === false && (
          <div className="space-y-4 font-din">
            <div>
              <label className="block text-sm font-medium text-neutral mb-1">
                Credibility score
              </label>
              <p className="text-lg text-primary">{credibility_score}</p>
              <p className="text-primary">Credibility Message: {getCredibilityMessage(credibility_score)}</p>
            </div>
            <div className="space-y-4">
              <label className="block text-sm font-medium text-neutral mb-1">
                Visualization
              </label>
              <div className="border border-neutral/20 rounded-md overflow-hidden p-2" style={{height: '500px'}}>
                {htmlPage ? (
                  <>
                    <iframe
                      title="Ontology Graph"
                      src={`http://127.0.0.1:4500${visualization_url}`}
                      width="100%"
                      height="800px"
                      style={{border: 'none'}}
                    ></iframe>
                  </>
                ) : (
                  <p>Loading...</p>
                )}
              </div>
            </div>


          </div>
        )}
      </div>
    </div>
  );
};