# Trabalhador de audio e PDF (faster-whisper e markitdown) em contêiner proprio (runbooks/06-media-worker.md).
# Versoes FIXAS em requirements.txt (o faster-whisper 1.2.1 quebra com o av mais novo). O modelo do Whisper e baixado AQUI, na construcao,
# porque em producao este contêiner fica numa rede sem internet (docs/plano/fase-1-arquitetura-e-compose.md). Modelo "small": o medido em 8 GB.
FROM python:3.12-slim
RUN useradd --create-home --uid 1000 trabalhador
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
ARG MODELO_WHISPER=small
RUN python -c "from faster_whisper.utils import download_model; download_model('${MODELO_WHISPER}', output_dir='/modelos/${MODELO_WHISPER}')" \
 && chown -R trabalhador:trabalhador /modelos
COPY transcrever.py converter_pdf.py /app/
USER trabalhador
# Nada de internet em tempo de execucao: o modelo vem do disco da imagem.
ENV HF_HUB_OFFLINE=1 HEIMDALL_MODELO_WHISPER=/modelos/${MODELO_WHISPER}
# Uso (um arquivo por vez): docker compose run --rm media-worker python /app/transcrever.py /entrada/<arquivo>   ou   .../converter_pdf.py
CMD ["python", "-c", "print('trabalhador de audio pronto: use docker compose run --rm media-worker python /app/transcrever.py /entrada/<arquivo>')"]
