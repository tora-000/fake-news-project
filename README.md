# Fake News Detactor

This project is an application for detecting the credibility of news, including a frontend (React) and a backend (Flask). Users can input text, and the system will analyze the text and return a credibility score and an entity relationship graph.

## How to Deploy

Run the following command in the frontend folder:

```sh
npm install
```

Run the following command in the frontend folder to start the React development server:

```sh
npm start
```
OR
```sh
npm run dev
```


Run the following command in the backend folder to start the Flask application:

```sh
python fake_news_definition.py
```

## Usage Instructions

1.	**Access the Frontend Application:**
Open http://localhost:3000 in your browser.
2.	**Enter Text:** Enter the text author and source you want to analyze in the text box. The text box will display the score standards as placeholder text.
3.	**Submit Text:** Click the "Check Credibility" button to submit the text.
4.	**View Results:** The system will return the credibility score and the entity relationship graph.

### Score Standards

* Score > 10: The news is very credible 
* Score > 7: The news is highly credible 
* Score > 5: The news is moderately credible 
* Score ≤ 5: The news is not credible 

## API Documentation

See [docs/backend.md](docs/backend.md) for backend API documentation.
