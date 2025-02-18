import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

const port = 4500;  // Change this port number if desired

function App() {
  const [text, setText] = useState('');
  const [author, setAuthor] = useState('');
  const [source, setSource] = useState('');
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`http://127.0.0.1:${port}/analyze`, { text, author, source });
      setResult(response.data);
    } catch (error) {
      console.error('Error fetching analysis:', error);
    }
  };

  const getCredibilityMessage = (score) => {
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

  return (
    <div className="App">
      <header className="App-header">
        <h1>Fake Sports News Detection</h1>
        <form onSubmit={handleSubmit}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`Enter text to analyze\n\nScore Standards:\nScore > 10: The news is very credible\nScore > 7: The news is highly credible\nScore > 5: The news is moderately credible\nScore ≤ 5: The news is not credible`}
            rows="8"
            cols="50"
          />
          <div>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Enter author name"
            />
          </div>
          <div>
            <input
              type="text"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="Enter source"
            />
          </div>
          <button type="submit">Check Credibility</button>
        </form>
        {result && (
          <div className="result">
            <h2>Results</h2>
            <p><strong>Credibility Score:</strong> {result.credibility_score}</p>
            <p><strong>Credibility Message:</strong> {getCredibilityMessage(result.credibility_score)}</p>
            <h3>Ontology Graph</h3>
            <iframe
              title="Ontology Graph"
              src={`http://127.0.0.1:${port}${result.visualization_url}`}
              width="100%"
              height="800px"
              style={{ border: 'none' }}
            ></iframe>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;