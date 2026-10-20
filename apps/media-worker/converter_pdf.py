"""Converte UM PDF em Markdown e imprime UMA linha JSON no stdout: {"markdown": str}.

Segue o aviso de seguranca do README do markitdown: so `convert_local()` (nunca `convert()` com URL), plugins desligados, arquivo apenas dentro
de /entrada, tamanho limitado, sem internet. Codigos de saida: 0 = ok; 3 = falha DEFINITIVA (arquivo grande demais, fora de /entrada); 1 = outra falha.
Uso: python converter_pdf.py /entrada/<arquivo>.pdf
"""
import json
import os
import sys

PASTA = "/entrada/"
MAX_BYTES = int(os.environ.get("HEIMDALL_PDF_MAX_BYTES", str(50 * 1024 * 1024)))


def falhar(motivo: str, codigo: int) -> None:
    print(f"erro:{motivo}", file=sys.stderr)
    sys.exit(codigo)


def main(argv: list) -> None:
    if len(argv) != 2:
        falhar("uso", 3)
    caminho = os.path.realpath(argv[1])
    if not caminho.startswith(PASTA) or not os.path.isfile(caminho):
        falhar("arquivo_fora_de_entrada", 3)
    if os.path.getsize(caminho) > MAX_BYTES:
        falhar("pdf_grande", 3)
    with open(caminho, "rb") as f:
        if f.read(5) != b"%PDF-":
            falhar("nao_e_pdf", 3)  # sem isso o markitdown trataria um arquivo qualquer como texto puro
    try:
        from markitdown import MarkItDown

        resultado = MarkItDown(enable_plugins=False).convert_local(caminho)
        markdown = resultado.text_content
    except Exception as e:  # noqa: BLE001 - so o TIPO do erro vai para o log
        falhar(f"conversao:{type(e).__name__}", 1)
    print(json.dumps({"markdown": markdown}, ensure_ascii=False))


if __name__ == "__main__":
    main(sys.argv)
