# markitdown — índice

Fonte: https://github.com/microsoft/markitdown (branch main). Não há site de documentação: a documentação é o README e os READMEs dos pacotes.

- [README](repo/README.md): formatos, instalação (`markitdown[all]` ou `[pdf]`), uso por linha de comando e Python, plugins, OCR por LLM, Azure, **Security Considerations**
- [LICENSE (MIT)](repo/LICENSE)
- Pacotes: [markitdown](packages/markitdown_README.md) · [markitdown-mcp (servidor MCP)](packages/markitdown-mcp_README.md) · [markitdown-ocr (plugin de OCR)](packages/markitdown-ocr_README.md) · [pyproject.toml](packages/markitdown_pyproject.toml) (dependências)
- Código: `source/_pdf_converter.py` (conversor de PDF: pdfminer.six + pdfplumber), `source/_markitdown.py` (API `MarkItDown`), `source/__main__.py` (CLI), `source/_base_converter.py`, `source/_exceptions.py`

Não incluído: conversores de outros formatos, testes, exemplos e a documentação do Azure Document Intelligence/Content Understanding.
