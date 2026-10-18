# faster-whisper — índice

Fonte: https://github.com/SYSTRAN/faster-whisper (branch master). O projeto não tem site de documentação: a documentação é o README e o código.

- [README](repo/README.md): benchmarks (GPU e CPU), requisitos, instalação, uso, transcrição em lote, filtro de silêncio (VAD), conversão de modelos, integrações da comunidade
- [LICENSE (MIT)](repo/LICENSE) · [requirements.txt](repo/requirements.txt) · [requirements.conversion.txt](repo/requirements.conversion.txt) · [setup.py](repo/setup.py) · [CONTRIBUTING.md](repo/CONTRIBUTING.md)
- Código da interface em `source/`:
  - `transcribe.py`: `WhisperModel` e todas as opções de `transcribe()` (beam_size, vad_filter, initial_prompt, hotwords, hallucination_silence_threshold, condition_on_previous_text, language, multilingual, batch_size)
  - `vad.py`: `VadOptions` (Silero VAD) · `utils.py`: lista de modelos disponíveis e `download_model` · `audio.py`: decodificação (PyAV) · `feature_extractor.py` · `tokenizer.py`
- Benchmarks em `benchmark/`: scripts de velocidade, memória e WER (`speed_benchmark.py`, `memory_benchmark.py`, `wer_benchmark.py`, `evaluate_yt_commons.py`)

Não incluído: o áudio de exemplo do benchmark (`benchmark.m4a`), testes, issues e discussões, cartões de modelo no Hugging Face e a documentação do CTranslate2 (motor de inferência).
