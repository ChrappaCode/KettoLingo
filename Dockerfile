FROM python:3.12-alpine

RUN pip3 install uv

WORKDIR /app
COPY requirements.lock ./

RUN uv pip install --no-cache --system -r requirements.lock

COPY . ./

CMD python import_languages.py && python import_categories.py && python import_csv.py && flask db upgrade --directory ./migrations && flask run --host=0.0.0.0 --port=5000
