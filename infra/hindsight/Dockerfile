# Hindsight com embeddings ONNX multilingues (runbooks/02-hindsight.md, "Armadilha: embeddings onnx na imagem slim", medido em 2026-10-20).
# A imagem slim oficial NAO sobe com HINDSIGHT_API_EMBEDDINGS_PROVIDER=onnx: falta o extra local-onnx (transformers e safetensors, sem torch).
# Versoes FIXAS: o transformers mais novo (5.20.2) exige tokenizers>=0.23.1, contra o <=0.23.0 do Hindsight. Atualizar so com teste (tests/infra/).
FROM ghcr.io/vectorize-io/hindsight:1.0.0-slim
USER root
# A imagem traz o uv; o venv /app/api/.venv nao tem pip. O diretorio do login do ChatGPT e o cache dos modelos nascem com o dono certo
# (UID 1000), para os volumes nomeados herdarem a permissao (os tokens rotacionam e o modelo e baixado na 1a subida: precisam ser gravaveis).
RUN uv pip install --python /app/api/.venv/bin/python 'hindsight-api-slim[local-onnx]==1.0.0' 'transformers==5.15.1' 'safetensors==0.8.0' \
 && mkdir -p /home/hindsight/chatgpt /home/hindsight/.cache \
 && chown hindsight:hindsight /home/hindsight/chatgpt /home/hindsight/.cache
USER hindsight
