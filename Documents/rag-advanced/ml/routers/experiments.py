from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import mlflow
import os
from typing import Dict, Any, Optional

router = APIRouter()

class ExperimentRun(BaseModel):
    name: str
    params: Optional[Dict[str, Any]] = None
    metrics: Optional[Dict[str, float]] = None

MLFLOW_URI = os.getenv("MLFLOW_TRACKING_URI", "http://127.0.0.1:5001")

@router.post("/log")
async def log_experiment(run_data: ExperimentRun):
    try:
        mlflow.set_tracking_uri(MLFLOW_URI)
        mlflow.set_experiment("RAG_Advanced_Experiments")
        
        with mlflow.start_run(run_name=run_data.name) as run:
            if run_data.params:
                mlflow.log_params(run_data.params)
            
            if run_data.metrics:
                mlflow.log_metrics(run_data.metrics)
                
            return {
                "run_id": run.info.run_id,
                "status": "success",
                "artifact_uri": run.info.artifact_uri
            }
            
    except Exception as e:
        print(f"MLflow logging error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
