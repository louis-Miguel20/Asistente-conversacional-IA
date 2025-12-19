PY?=.venv\Scripts\python
PIP?=.venv\Scripts\pip

.PHONY: venv install test run clean

venv:
	python -m venv .venv

install:
	$(PY) -m pip install --upgrade pip
	$(PIP) install -r requirements.txt

test:
	$(PY) -m pytest -q

run:
	$(PY) -m assistant.cli

clean:
	- rd /s /q .venv 2> NUL
	- del /q /f .pytest_cache 2> NUL
	- del /q /f *.pytest_cache 2> NUL
