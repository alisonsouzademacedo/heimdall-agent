"""Transcreve UM audio e imprime UMA linha JSON no stdout: {"texto": str, "idioma": str, "duracao_s": float}.

Roda dentro do contêiner `media-worker` (sem internet; o modelo vem do disco da imagem). Nada de conteudo de conversa no stderr:
so motivos curtos. Codigos de saida: 0 = ok; 3 = falha DEFINITIVA (nao adianta repetir: audio longo demais, arquivo fora de /entrada); 1 = outra falha.
Uso: python transcrever.py /entrada/<arquivo>
"""
import json
import os
import sys

PASTA = "/entrada/"
MAX_SEGUNDOS = float(os.environ.get("HEIMDALL_AUDIO_MAX_S", "3600"))


def falhar(motivo: str, codigo: int) -> None:
    print(f"erro:{motivo}", file=sys.stderr)
    sys.exit(codigo)


def main(argv: list) -> None:
    if len(argv) != 2:
        falhar("uso", 3)
    caminho = os.path.realpath(argv[1])
    if not caminho.startswith(PASTA) or not os.path.isfile(caminho):
        falhar("arquivo_fora_de_entrada", 3)
    try:
        from faster_whisper import WhisperModel

        modelo = WhisperModel(os.environ["HEIMDALL_MODELO_WHISPER"], device="cpu", compute_type="int8", local_files_only=True, cpu_threads=2)  # = cpus do Compose; medido: 2 threads em 2 CPUs ficou 1,7x mais rapido que o padrao de 4
        # Portugues fixo, filtro de silencio e sem "condicionar no texto anterior" (evita repeticao em cadeia e alucinacao em trechos mudos).
        segmentos, info = modelo.transcribe(caminho, language="pt", beam_size=5, vad_filter=True, condition_on_previous_text=False)
        if info.duration > MAX_SEGUNDOS:
            falhar("audio_longo", 3)
        texto = " ".join(s.text.strip() for s in segmentos if s.text.strip())
    except SystemExit:
        raise
    except Exception as e:  # noqa: BLE001 - so o TIPO do erro vai para o log, nunca o conteudo
        falhar(f"transcricao:{type(e).__name__}", 1)
    print(json.dumps({"texto": texto, "idioma": info.language, "duracao_s": round(float(info.duration), 1)}, ensure_ascii=False))


if __name__ == "__main__":
    main(sys.argv)
