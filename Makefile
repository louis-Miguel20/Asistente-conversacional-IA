PY?=.venv\Scripts\python
PIP?=.venv\Scripts\pip

.PHONY: venv install test clean run dev lint

venv:
	python -m venv .venv

install:
	$(PIP) install --upgrade pip
	$(PIP) install -r requirements.txt

test:
	$(PY) -m pytest -q

lint:
	$(PY) -m pylint src tests || true
	$(PY) -m black --check src tests || true

run:
	$(PY) -m uvicorn src.api.main:app --host 0.0.0.0 --port 8000

dev:
	$(PY) -m uvicorn src.api.main:app --reload --host 0.0.0.0 --port 8000

clean:
	- rd /s /q .venv 2> NUL
	- del /q /f .pytest_cache 2> NUL
	- del /q /f *.pytest_cache 2> NUL
