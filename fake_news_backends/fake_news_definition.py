#!/usr/bin/env python3
import spacy
from flask import Flask, request, jsonify, send_from_directory
import requests
from textblob import TextBlob
import networkx as nx
import matplotlib
import matplotlib.pyplot as plt
from flask_cors import CORS
import os
from rdflib import Graph, URIRef, Literal, Namespace
from rdflib.namespace import RDF, RDFS
import uuid

matplotlib.use('agg')

# Load spaCy model
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    from spacy.cli import download

    download("en_core_web_sm")
    nlp = spacy.load("en_core_web_sm")

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS


# Analyze text using spaCy
def analyze_text(text):
    doc = nlp(text)
    return [(ent.text, ent.label_) for ent in doc.ents]


# Get information from Wikidata
def get_wikidata_info(entity):
    url = f"https://www.wikidata.org/w/api.php?action=wbsearchentities&search={entity}&language=en&format=json"
    response = requests.get(url)
    print(response.json())
    try:
        return response.json()
    except requests.exceptions.JSONDecodeError:
        return None


# Get information from DBpedia
def get_dbpedia_info(entity):
    url = f"http://dbpedia.org/data/{entity}.json"
    response = requests.get(url)
    try:
        return response.json()
    except requests.exceptions.JSONDecodeError:
        return None


# Get news data from News API
def get_news_data(entities):
    api_key = "pub_64290956f5b1246228d05479760d1b1331bdf"
    query = " ".join(entities)
    url = f"https://newsdata.io/api/1/latest?apikey={api_key}&q={query}"
    response = requests.get(url)
    try:
        return response.json()
    except requests.exceptions.JSONDecodeError:
        return []


# Analyze sentiment using TextBlob
def analyze_sentiment(text):
    blob = TextBlob(text)
    return blob.sentiment.polarity


# Calculate credibility score based on multiple sources, including news data
def calculate_credibility_score(entities, news_data, text):
    score = 0
    for entity in entities:
        entity_score = 0
        if len(get_wikidata_info(entity)['search']):
            entity_score += 1
            print("wiki+1")
        if get_dbpedia_info(entity):
            entity_score += 1
            print("dbpedia+1")
        score += entity_score
    # Adjust score based on the number of articles returned by News API
    length = news_data.get("totalResults", 0)
    score += length / 10
    sentiment = analyze_sentiment(text)
    if sentiment > 0.1:
        score += 2
        print("sentiment+2")
    elif sentiment < -0.1:
        print("sentiment-2")
        score -= 2

    return score if entities else 0


# Define ontology relationships using RDFLib and ensure author and source are included
def define_ontology_with_rdflib(entities, author, source):
    g = Graph()
    EX = Namespace("http://example.org/")

    # Add entities and relationships to the graph
    g.add((URIRef(EX[author]), RDF.type, EX.Author))
    g.add((URIRef(EX[source]), RDF.type, EX.Source))
    for entity in entities:
        g.add((URIRef(EX[entity]), RDF.type, EX.Entity))

    return g


# Create a static graph visualization of the entities and their relationships using matplotlib and networkx
def create_graph_with_rdflib(entities, author, source):
    g = define_ontology_with_rdflib(entities, author, source)

    # Query the graph and print data
    qres = g.query(
        """
        SELECT ?subject ?predicate ?object
        WHERE {
            ?subject ?predicate ?object
        }
        """
    )

    for row in qres:
        print(f"{row.subject} {row.predicate} {row.object}")

    # Continue using NetworkX and Matplotlib for visualization
    G = nx.Graph()

    # Add nodes and edges based on entities and their relationships
    relationships = [(author, "Author"), (source, "Source")]
    for entity in entities:
        if entity.lower() != author.lower() and entity.lower() != source.lower():
            relationships.append((entity, "Entity"))

    for entity, label in relationships:
        G.add_node(entity, label=f"{entity} ({label})")

    G.add_edge(author, source)
    if len(relationships) > 1:
        for i in range(len(relationships) - 1):
            G.add_edge(relationships[i][0], relationships[i + 1][0])

    plt.figure(figsize=(12, 8))
    pos = nx.spring_layout(G)
    labels = nx.get_node_attributes(G, 'label')
    nx.draw(G, pos, with_labels=True, labels=labels, node_color='skyblue', node_size=2000, edge_color='gray',
            font_size=10, font_weight='bold')

    # Save the graph with a unique filename to avoid caching issues
    graph_filename = f'graph_{uuid.uuid4().hex}.png'

    plt.savefig(graph_filename)

    return graph_filename


# Route for analyzing text and calculating credibility score
@app.route('/credibility', methods=['POST'])
def credibility():
    data = request.json
    text = data.get('text', '')

    author = data.get('author', 'Unknown Author')
    source = data.get('source', 'Unknown Source')

    entities = [ent[0] for ent in analyze_text(text)]

    if author not in entities:
        entities.append(author)
    if source not in entities:
        entities.append(source)

    news_data = get_news_data([ent[0] for ent in analyze_text(text)])

    score = calculate_credibility_score(entities, news_data, text)

    graph_filename = create_graph_with_rdflib(entities, author, source)

    return jsonify({
        'entities': entities,
        'credibility_score': score,
        'news_data': news_data,
        'graph_url': graph_filename
    })


# Route for serving the graph file
@app.route('/graph/<filename>')
def graph(filename):
    return send_from_directory(os.getcwd(), filename)


if __name__ == '__main__':
    app.run(debug=True)