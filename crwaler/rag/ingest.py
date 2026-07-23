import os
import uuid
import pandas as pd
import chromadb
from sentence_transformers import SentenceTransformer

# ----------------------------
# CONFIG
# ----------------------------

KNOWLEDGE_FOLDER = "./knowledge_base"
VECTOR_DB = "./vector_db"
COLLECTION_NAME = "growtrace_knowledge"

CHUNK_SIZE = 800
CHUNK_OVERLAP = 150

# ----------------------------
# EMBEDDING MODEL
# ----------------------------

print("Loading embedding model...")

model = SentenceTransformer("all-MiniLM-L6-v2")

print("Embedding model loaded.")

# ----------------------------
# CHROMADB
# ----------------------------

client = chromadb.PersistentClient(path=VECTOR_DB)

try:
    client.delete_collection(COLLECTION_NAME)
    print("Old collection deleted.")
except:
    pass

collection = client.create_collection(COLLECTION_NAME)

# ----------------------------
# TEXT CHUNKER
# ----------------------------

def chunk_text(text, chunk_size=800, overlap=150):

    chunks = []

    start = 0

    while start < len(text):

        end = start + chunk_size

        chunks.append(text[start:end])

        start += chunk_size - overlap

    return chunks

# ----------------------------
# INGEST MARKDOWN & TEXT
# ----------------------------

total_chunks = 0

for root, dirs, files in os.walk(KNOWLEDGE_FOLDER):

    for file in files:

        filepath = os.path.join(root, file)

        extension = os.path.splitext(file)[1].lower()

        # ------------------------
        # MARKDOWN / TXT
        # ------------------------

        if extension in [".md", ".txt"]:

            try:

                with open(filepath, "r", encoding="utf-8") as f:
                    text = f.read()

                if not text.strip():
                    continue

                chunks = chunk_text(text)

                for index, chunk in enumerate(chunks):

                    embedding = model.encode(chunk).tolist()

                    collection.add(
                        ids=[str(uuid.uuid4())],
                        documents=[chunk],
                        embeddings=[embedding],
                        metadatas=[{
                            "source": filepath,
                            "filename": file,
                            "chunk": index,
                            "type": extension
                        }]
                    )

                    total_chunks += 1

                print(f"Added {len(chunks)} chunks -> {filepath}")

            except Exception as e:

                print("Error:", filepath)
                print(e)

        # ------------------------
        # CSV FILES
        # ------------------------

        elif extension == ".csv":

            try:

                df = pd.read_csv(filepath)

                for row_index, row in df.iterrows():

                    row_text = " | ".join(
                        [f"{col}: {row[col]}" for col in df.columns]
                    )

                    embedding = model.encode(row_text).tolist()

                    collection.add(
                        ids=[str(uuid.uuid4())],
                        documents=[row_text],
                        embeddings=[embedding],
                        metadatas=[{
                            "source": filepath,
                            "filename": file,
                            "row": int(row_index),
                            "type": "csv"
                        }]
                    )

                    total_chunks += 1

                print(f"Added {len(df)} rows -> {filepath}")

            except Exception as e:

                print("CSV Error:", filepath)
                print(e)

# ----------------------------
# DONE
# ----------------------------

print("\n===================================")
print("GrowTrace Knowledge Base Ready")
print("===================================")
print("Total Embedded Documents:", total_chunks)
print("Collection:", COLLECTION_NAME)
print("Database:", VECTOR_DB)