# API Documentation for Backend

## Introduction

This backend program uses the HTTP protocol for connection, sending and receiving a specific format of JSON as input and output.

By default, this application uses TCP port 4500 for communication between frontend and backend. If you wish to change it, please modify the variable `port` in **BOTH** `fake_news_backends/fake_news_definition.py` and `creadibility-checker_frontend/App.js`

## Analyzing

### Connection

* URL Path: `/analyze`
* HTTP method: `POST`

### Input

JSON Format:

```plain
{
    "text": string,
    "author": string,
    "source": string
}
```

* `text`: The text to be analyzed
* `author`: The author of the analyzed text
* `source`: The source (usually URL) of the text

### Output

JSON Format:

```plain
{
    "credibility_score": number,
    "visualization_url": string,
    "rdf_triples": string
}
```

* `credibility_score`: An integer indicating the score of the credibility. Higher is better. See [README.md](../README.md) for details.
* `visualization_url`: The URL to the RDF visualization graph (see below for details)
* `rdf_triples`: The RDF triple, in Turtle format.

## Visualization

### Connection

* URL Path: `/visualization/<filename>` (the `filename` string is from **Analyzing** section)
* HTTP method: `GET`

### Output

A PNG graph representing the RDF visualization graph.
