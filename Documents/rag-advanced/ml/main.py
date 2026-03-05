import os
from fastapi import FastAPI
import mlflow
from mlflow.tracking import MlflowClient

app = FastAPI(title="API ML RAG Avanzado")

# Configurar MLflow
MLFLOW_TRACKING_URI = os.getenv("MLFLOW_TRACKING_URI", "http://localhost:5000")
mlflow.set_tracking_uri(MLFLOW_TRACKING_URI)

@app.get("/")
def read_root():
    return {"message": "Servicio ML RAG Avanzado"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.get("/experiments")
def list_experiments():
    client = MlflowClient()
    experiments = client.search_experiments()
    return [{"id": e.experiment_id, "name": e.name} for e in experiments]

@app.post("/log-feedback")
def log_feedback(query: str, response: str, rating: int):
    """
    Registrar retroalimentación del usuario en MLflow para evaluación
    """
    with mlflow.start_run(run_name="user_feedback"):
        mlflow.log_param("query", query)
        mlflow.log_param("response", response)
        mlflow.log_metric("rating", rating)
    
    return {"status": "registrado"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
