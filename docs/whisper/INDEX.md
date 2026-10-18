# Whisper — índice

Fontes: repositório https://github.com/openai/whisper (branch main) e https://openai.com/pt-BR/index/whisper/ (anúncio de 2022, via Firecrawl).

- [Apresentando o Whisper (OpenAI, pt-BR)](openai-apresentando-o-whisper.md)
- [README do repositório](repo/README.md): instalação, tabela de modelos e VRAM, uso por linha de comando e Python
- [Model card](repo/model-card.md): usos, limitações (alucinação, repetição, desempenho desigual por idioma)
- [Dados de treino](repo/data_README.md)
- [LICENSE (MIT)](repo/LICENSE) · [pyproject.toml](repo/pyproject.toml) · [requirements.txt](repo/requirements.txt)
- Código da interface em `source/`: `__init__.py` (load_model), `transcribe.py` (opções e janela de 30 s), `decoding.py` (DecodingOptions), `audio.py` (ffmpeg), `model.py`, `tokenizer.py`, `timing.py`, `utils.py`

Não incluído: notebooks de exemplo, testes, discussões do GitHub (Q&A de desempenho e alucinação), artigo da pesquisa (arXiv 2212.04356) e o `faster-whisper`, reimplementação que o Hermes usa para transcrição local.
