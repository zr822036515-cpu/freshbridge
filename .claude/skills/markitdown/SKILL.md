---
name: markitdown
description: Convert files and office documents (PDF, Word, Excel, PPT, images, HTML, etc.) to Markdown. Use when the user provides a file path and wants to convert it to Markdown format.
---

# MarkItDown - File to Markdown Converter

## Overview

Convert various file formats to Markdown using Microsoft's [MarkItDown](https://github.com/microsoft/markitdown) tool. Supports PDF, Word (.docx), PowerPoint (.pptx), Excel (.xlsx/.xls), images (OCR), audio (transcription), HTML, CSV, JSON, XML, ZIP, and more.

## Usage

### Convert a file to Markdown

```bash
markitdown "<file-path>" -o "<output-path>.md"
```

Or output to stdout:

```bash
markitdown "<file-path>"
```

### Convert with AI-powered image descriptions (optional)

If an OpenAI API key is available:

```bash
python -c "
from markitdown import MarkItDown
from openai import OpenAI
client = OpenAI()
md = MarkItDown(llm_client=client, llm_model='gpt-4o')
result = md.convert('<file-path>')
print(result.text_content)
"
```

## Steps

1. Verify the input file exists: `ls -la "<file-path>"`
2. Determine output path (same directory, `.md` extension)
3. Run `markitdown "<file-path>" -o "<output-path>"`
4. Read and display the result to the user
5. Clean up temp output file if user doesn't need it kept

## Notes

- The `markitdown` command is installed globally via pip (`markitdown[all]`)
- Large files may take time to process (especially PDFs with OCR, audio with transcription)
- For stdin mode: `markitdown < file.pdf` (not `cat file.pdf | markitdown`)
