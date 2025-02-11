import spacy
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from rdflib import Graph, URIRef,Namespace
from rdflib.namespace import RDF, RDFS, OWL
from SPARQLWrapper import SPARQLWrapper, JSON
import uuid
import os
from pyvis.network import Network


app = Flask(__name__)
CORS(app)

EX = Namespace("http://example.org/ontology#")
WD = Namespace("http://www.wikidata.org/entity/")
WDT = Namespace("http://www.wikidata.org/prop/direct/")

def create_ontology(author, source, entities):
    g = Graph()
    g.bind("ex", EX)
    g.bind("wd", WD)
    g.add((EX.SportsArticle, RDF.type, OWL.Class))
    g.add((EX.Person, RDF.type, OWL.Class))
    g.add((EX.Athlete, RDFS.subClassOf, EX.Person))
    g.add((EX.SportsTeam, RDF.type, OWL.Class))
    g.add((EX.SportsEvent, RDF.type, OWL.Class))
    g.add((EX.NewsSource, RDFS.subClassOf, EX.Organization))

    article = EX[f"Article_{uuid.uuid4().hex}"]
    g.add((article, RDF.type, EX.SportsArticle))
    author_uri = link_wikidata_entity(g, author, 'PERSON')
    g.add((article, EX.hasAuthor, author_uri))
    source_uri = link_wikidata_entity(g, source, 'ORG')
    g.add((article, EX.hasSource, source_uri))

    for entity in entities:
        entity_uri = link_wikidata_entity(g, entity['text'], entity['type'])
        g.add((article, EX.mentionsEntity, entity_uri))

        if entity['type'] == 'ATHLETE':
            events = get_athlete_events(entity['text'])
            for event_name in events:
                event_uri = link_wikidata_entity(g, event_name, 'EVENT')
                g.add((entity_uri, EX.participatesIn, event_uri))

    return g

def link_wikidata_entity(graph, label, entity_type):
    type_mapping = {
        'PERSON': 'wd:Q5',
        'ATHLETE': 'wd:Q5',
        'ORG': 'wd:Q43229',
        'TEAM': 'wd:Q12973014',
        'EVENT': 'wd:Q1656682'
    }

    if entity_type not in type_mapping:
        raise ValueError(f": {entity_type}")

    query = f"""
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    SELECT ?item WHERE {{
      ?item rdfs:label "{label}"@en;
            wdt:P31/wdt:P279* {type_mapping[entity_type]}.
    }} LIMIT 1
    """

    result = sparql_query(query)
    if result:
        wd_id = result[0]['item']['value'].split("/")[-1]
        local_uri = URIRef(EX[f"{label.replace(' ', '_')}"])
        graph.add((local_uri, OWL.sameAs, URIRef(WD[wd_id])))
        return local_uri

    return URIRef(EX[f"{label.replace(' ', '_')}"])


def get_athlete_events(athlete_name):
    """获取运动员参与的赛事"""
    query = f"""
    SELECT DISTINCT ?eventLabel WHERE {{
      ?athlete rdfs:label "{athlete_name}"@en;
               wdt:P106 wd:Q2066131;  
               wdt:P1344 ?event.      
      ?event rdfs:label ?eventLabel.
      FILTER(LANG(?eventLabel) = "en")
    }}
    """
    return [res['eventLabel']['value'] for res in sparql_query(query)]


def sparql_query(query):
    endpoint = "https://query.wikidata.org/sparql"
    try:
        sparql = SPARQLWrapper(endpoint)
        sparql.setQuery(query)
        sparql.setReturnFormat(JSON)
        results = sparql.query().convert()
        return results['results']['bindings']
    except Exception as e:
        print(f"SPARQL error: {str(e)}")
        return []

def calculate_credibility(graph):
    score = 0

    verified_entities = list(graph.subjects(OWL.sameAs, None))
    score += len(verified_entities) * 3

    score += len(list(graph.subject_objects(EX.participatesIn))) * 5

    source = list(graph.objects(None, EX.hasSource))
    if source:
        source_uri = source[0]
        if (source_uri, OWL.sameAs, WD.Q746242) in graph:  # ESPN
            score += 10
        elif (source_uri, OWL.sameAs, WD.Q9531) in graph:  # BBC Sport
            score += 8

    authors = list(graph.objects(None, EX.hasAuthor))
    for author in authors:
        if (author, OWL.sameAs, None) in graph:
            score += 2

    return score

def generate_visualization(graph):
    net = Network(height="800px", width="100%", directed=True)

    node_config = {
        "SportsArticle": {"color": "#FF6B6B", "size": 30},
        "Person": {"color": "#4ECDC4", "size": 25},
        "Organization": {"color": "#45B7D1", "size": 25},
        "SportsEvent": {"color": "#96CEB4", "size": 25}
    }

    nodes = {}
    for s, p, o in graph:
        if isinstance(s, URIRef):
            node_id = str(s)
            if node_id not in nodes:
                node_type = get_node_type(s, graph)
                nodes[node_id] = {
                    "label": node_id.split("#")[-1],
                    "color": node_config.get(node_type, {}).get("color", "#CCCCCC"),
                    "size": node_config.get(node_type, {}).get("size", 20)
                }

        if isinstance(o, URIRef):
            node_id = str(o)
            if node_id not in nodes:
                node_type = get_node_type(o, graph)
                nodes[node_id] = {
                    "label": node_id.split("#")[-1],
                    "color": node_config.get(node_type, {}).get("color", "#CCCCCC"),
                    "size": node_config.get(node_type, {}).get("size", 20)
                }

    for node_id, attrs in nodes.items():
        net.add_node(node_id, label=attrs["label"], color=attrs["color"], size=attrs["size"])

    for s, p, o in graph:
        if isinstance(p, URIRef) and isinstance(o, URIRef):
            net.add_edge(str(s), str(o), label=p.split("#")[-1], arrows="to")

    filename = f"kg_{uuid.uuid4().hex}.html"
    net.save_graph(filename)
    return filename


def get_node_type(node_uri, graph):
    for cls in [EX.SportsArticle, EX.Person, EX.Organization, EX.SportsEvent]:
        if (node_uri, RDF.type, cls) in graph:
            return cls.split("#")[-1]
    return None

@app.route('/analyze', methods=['POST'])
def analyze_article():
    data = request.get_json()
    text = data.get('text', '')
    author = data.get('author', 'author')
    source = data.get('source', 'source')

    nlp = spacy.load("en_core_web_sm")
    doc = nlp(text)

    entities = []
    for ent in doc.ents:
        ent_type = None
        if ent.label_ == "PERSON":
            ent_type = 'PERSON'
        elif ent.label_ == "ORG":
            ent_type = 'ORG'
        elif ent.label_ == "GPE" and any(kw in ent.text.lower() for kw in ['cup', 'championship']):
            ent_type = 'EVENT'

        if ent_type:
            entities.append({'text': ent.text, 'type': ent_type})

    ontology_graph = create_ontology(author, source, entities)

    credibility = calculate_credibility(ontology_graph)

    viz_file = generate_visualization(ontology_graph)

    return jsonify({
        "credibility_score": credibility,
        "visualization_url": f"/visualization/{viz_file}",
        "rdf_triples": ontology_graph.serialize(format="turtle")
    })


@app.route('/visualization/<filename>')
def serve_visualization(filename):
    return send_from_directory(os.getcwd(), filename)


if __name__ == '__main__':
    nlp = spacy.load("en_core_web_sm")
    app.run(host='0.0.0.0', port=5000, debug=True)