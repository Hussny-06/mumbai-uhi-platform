# 📚 Mumbai UHI Platform: Academic Research Paper & Synopsis Hub

This unified directory consolidates all academic publications, journal submission templates, literature survey papers, and project synopsis assets for the **Mumbai Urban Heat Island (UHI) AI Climate Platform**.

---

## 🗂️ Directory Architecture

```
research_and_synopsis/
├── README.md                      <- Master index and guide (this document)
│
├── manuscript/                    <- Official Elsevier CAS LaTeX Journal Paper
│   ├── Elsevier_s_CAS_LaTeX_Single_Column_Template.tex  <- Primary LaTeX manuscript source
│   ├── Elsevier_s_CAS_LaTeX_Single_Column_Template.pdf  <- Compiled manuscript preview (5.2 MB)
│   ├── cas-sc.cls                 <- Elsevier Single-Column document class
│   ├── cas-common.sty             <- Elsevier CAS LaTeX formatting & macro styles
│   ├── cas-model2-names.bst       <- BibTeX author-year bibliography style
│   ├── references.bib             <- BibTeX citations file
│   ├── README.txt                 <- Original submission instructions
│   ├── figs/                      <- 300 DPI high-resolution figures referenced in the paper:
│   │   ├── review1_true_color.png
│   │   ├── ArchitectureDiagram.png
│   │   ├── review1_geospatial_layers_4panel.png
│   │   ├── review1_downscaling_validation.png
│   │   ├── asad_27yr_temperature_trend.png
│   │   ├── asad_shap_analysis_xgboost.png
│   │   └── asad_simulation_scenarios.png
│   └── thumbnails/                <- CAS journal logo icons (cas-email, cas-url, etc.)
│
├── literature_papers/             <- 8 Core Literature Survey & Benchmark Papers (PDFs)
│   ├── remotesensing-13-02211-v2.pdf  <- Benchmark LST remote sensing study (92 MB)
│   ├── ML Land Surface temp downscaling.pdf
│   ├── Towards an improved representation of the urban heat island effect... (Madrid XGBoost).pdf
│   ├── UHM paper 1.pdf
│   ├── main-litreature review.pdf
│   ├── isprs-archives-XLIX-B3-2026-405-2026.pdf
│   ├── s11084-026-09736-6.pdf
│   ├── OE_article_125302.pdf
│   └── uhm_paper_first5pages.txt  <- Reference paper transcript (Manna et al., 2024)
│
├── synopsis/                      <- Project Synopsis, Review Decks & Extracted Visuals
│   ├── review2_project_synopsis.md  <- Complete Review 2 Project Synopsis (4-member team)
│   ├── review1_presentation_deck.md <- 11-slide Review 1 deck with literature survey
│   ├── review2_presentation_deck.md <- Complete Review 2 presentation deck
│   ├── review2_simple_ppt.md        <- Simplified presentation slide notes
│   └── images/                      <- Synopsis figures and extracted figures (p1_1__Im1.png to p48_10__Im11.png)
│
├── drafts_and_extracts/           <- Manuscript Text Extraction & Generator Helpers
│   ├── extracted_docx_text.txt    <- Extracted Word document text of the research paper
│   └── generate_paper_tex.py      <- LaTeX manuscript generator helper script
│
├── templates/                     <- Raw Elsevier CAS Distribution & Docs
│   ├── els-cas-templates/         <- Official Elsevier sample documents, documentation, & guides
│   └── els-cas-templates.zip      <- Upstream Elsevier CAS distribution archive (3.3 MB)
│
└── compilers_and_archives/        <- Standalone TeX Compiler & Overleaf Archives
    ├── tectonic.exe               <- Standalone XeTeX compiler for Windows (no MiKTeX needed)
    ├── tectonic.zip               <- Tectonic compiler package (21 MB)
    ├── mumbai_uhi_elsevier_manuscript_overleaf.zip <- Complete Overleaf project export (12.8 MB)
    └── mumbai_uhi_elsevier_overleaf.zip            <- Backup archive placeholder
```

---

## 🚀 How to Work with the Paper

### 1. Compiling Locally with Tectonic
To compile the manuscript locally without installing full TeXLive or MiKTeX distributions:
```powershell
cd research_and_synopsis\manuscript
..\compilers_and_archives\tectonic.exe Elsevier_s_CAS_LaTeX_Single_Column_Template.tex
```

### 2. Working on Overleaf
1. Log in to [Overleaf](https://www.overleaf.com/project).
2. Click **New Project** -> **Upload Project**.
3. Select `research_and_synopsis/compilers_and_archives/mumbai_uhi_elsevier_manuscript_overleaf.zip`.
4. Ensure the Overleaf compiler is set to **pdfLaTeX** or **XeLaTeX**.
5. Click **Recompile**.
