#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
strip_comments.py
Supprime les commentaires des fichiers HTML / JS / CSS d'un projet.

Méthodes de commentaires gérées
-------------------------------
  HTML : <!-- ... -->            (+ conditionnels <!--[if IE]> ... <![endif]-->)
  JS   : // ligne  et  /* bloc */ (en respectant chaînes ' " , templates `...${...}`
                                   et expressions régulières /re/flags)
  CSS  : /* bloc */              (en respectant les chaînes)

Dans les fichiers HTML, les blocs <script> et <style> sont traités avec le
parseur JS / CSS correspondant (désactivable avec --no-embedded).

GARDE-FOUS (important)
----------------------
1. Les fichiers MINIFIÉS (*.min.js, *.min.css, ou lignes très longues) sont
   IGNORÉS par défaut : les "décommenter" n'a aucun intérêt et le risque
   d'abîmer du code est trop grand. Utilise --include-min pour les inclure.
2. Avant d'écrire, on vérifie qu'AUCUN littéral (chaîne / template / regex)
   n'a été perdu. Si un doute existe, le fichier est IGNORÉ et signalé.
3. Les fins de ligne (LF / CRLF) sont préservées telles quelles.
4. Sauvegarde .bak automatique (sauf --no-backup).

Le script est NON destructif par défaut : sans --write il fait une analyse.

Exemples
--------
  python3 strip_comments.py .                          # analyse, n'écrit rien
  python3 strip_comments.py . --write                  # applique + .bak
  python3 strip_comments.py . --write --keep-important # garde /*! ... */ et //# sourceMappingURL
  python3 strip_comments.py . --write --include-min    # inclut aussi les fichiers minifiés
  python3 strip_comments.py . --ext html,js,css        # limite les extensions
"""

import argparse
import os
import re
import sys

# ---------------------------------------------------------------------------
# JS : helpers
# ---------------------------------------------------------------------------

# Un '/' démarre une regex si le caractère significatif précédent est l'un de
# ceux-ci (opérateurs / ponctuation ouvrante).
JS_REGEX_PREV = set("(,=:[!&|?{};+-*%^~<>")

# ...ou si le dernier mot est un mot-clé pouvant être suivi d'une expression.
JS_REGEX_KEYWORDS = {
    "return", "typeof", "instanceof", "in", "of", "new", "delete",
    "void", "do", "else", "yield", "await", "case", "throw",
}


def _regex_allowed(prev, word):
    if word:
        return word in JS_REGEX_KEYWORDS
    return prev == "" or prev in JS_REGEX_PREV


def _js_skip_string(src, i):
    """src[i] est un guillemet. Renvoie l'index juste après la chaîne."""
    q = src[i]
    i += 1
    n = len(src)
    while i < n:
        c = src[i]
        if c == "\\":
            i += 2
            continue
        if c == q:
            return i + 1
        if c == "\n":
            return i
        i += 1
    return n


def _js_skip_regex(src, i):
    """src[i] == '/'. Renvoie l'index après la regex (et ses flags)."""
    i += 1
    n = len(src)
    in_class = False
    while i < n:
        c = src[i]
        if c == "\\":
            i += 2
            continue
        if c == "[":
            in_class = True
        elif c == "]":
            in_class = False
        elif c == "/" and not in_class:
            i += 1
            while i < n and src[i].isalpha():
                i += 1
            return i
        elif c == "\n":
            return i
        i += 1
    return n


def _js_skip_template(src, i):
    """src[i] == '`'. Renvoie l'index après le template complet."""
    i += 1
    n = len(src)
    while i < n:
        c = src[i]
        if c == "\\":
            i += 2
            continue
        if c == "`":
            return i + 1
        if c == "$" and i + 1 < n and src[i + 1] == "{":
            i = _js_skip_brace(src, i + 1)
            continue
        i += 1
    return n


def _js_skip_brace(src, i):
    """src[i] == '{'. Renvoie l'index juste après le '}' correspondant."""
    depth = 0
    n = len(src)
    prev = "{"
    word = ""
    while i < n:
        c = src[i]
        nxt = src[i + 1] if i + 1 < n else ""
        if c == "{":
            depth += 1
            prev = c
            word = ""
            i += 1
            continue
        if c == "}":
            depth -= 1
            i += 1
            if depth == 0:
                return i
            prev = c
            word = ""
            continue
        if c == '"' or c == "'":
            i = _js_skip_string(src, i)
            prev = c
            word = ""
            continue
        if c == "`":
            i = _js_skip_template(src, i)
            prev = "`"
            word = ""
            continue
        if c == "/" and nxt == "/":
            j = src.find("\n", i)
            i = n if j == -1 else j
            continue
        if c == "/" and nxt == "*":
            j = src.find("*/", i + 2)
            i = n if j == -1 else j + 2
            continue
        if c == "/" and _regex_allowed(prev, word):
            i = _js_skip_regex(src, i)
            prev = "/"
            word = ""
            continue
        if c.isalnum() or c in "_$":
            word += c
        elif not c.isspace():
            word = ""
        if not c.isspace():
            prev = c
        i += 1
    return n


def strip_js_comments(src, keep_important=False, collect=None):
    """Retire // et /* */ d'un source JavaScript.

    Si `collect` est une liste, chaque commentaire retiré y est ajouté.
    """
    out = []
    i = 0
    n = len(src)
    prev = ""      # dernier caractère significatif émis
    word = ""      # identifiant en cours (pour repérer les mots-clés)

    while i < n:
        c = src[i]
        nxt = src[i + 1] if i + 1 < n else ""

        # commentaire ligne // ...
        if c == "/" and nxt == "/":
            j = src.find("\n", i)
            end = n if j == -1 else j
            if end > i and src[end - 1] == "\r":   # conserve le \r (CRLF)
                end -= 1
            if collect is not None:
                collect.append(src[i:end])
            if keep_important and src[i:end].startswith(("//#", "//@")):
                out.append(src[i:end])
            i = end
            continue

        # commentaire bloc /* ... */
        if c == "/" and nxt == "*":
            j = src.find("*/", i + 2)
            end = n if j == -1 else j + 2
            if collect is not None:
                collect.append(src[i:end])
            if keep_important and src[i:end].startswith("/*!"):
                out.append(src[i:end])
            i = end
            continue

        # chaînes
        if c == '"' or c == "'":
            j = _js_skip_string(src, i)
            out.append(src[i:j])
            prev, word = c, ""
            i = j
            continue

        # template literal
        if c == "`":
            j = _js_skip_template(src, i)
            out.append(src[i:j])
            prev, word = "`", ""
            i = j
            continue

        # regex
        if c == "/" and _regex_allowed(prev, word):
            j = _js_skip_regex(src, i)
            out.append(src[i:j])
            prev, word = "/", ""
            i = j
            continue

        out.append(c)
        if c.isalnum() or c in "_$":
            word += c
        elif not c.isspace():
            word = ""
        if not c.isspace():
            prev = c
        i += 1
    return "".join(out)


def js_literals(src):
    """Liste des littéraux (chaînes / templates / regex) d'un source JS."""
    out = []
    i = 0
    n = len(src)
    prev = ""
    word = ""
    while i < n:
        c = src[i]
        nxt = src[i + 1] if i + 1 < n else ""
        if c == "/" and nxt == "/":
            j = src.find("\n", i)
            i = n if j == -1 else j
            continue
        if c == "/" and nxt == "*":
            j = src.find("*/", i + 2)
            i = n if j == -1 else j + 2
            continue
        if c == '"' or c == "'":
            j = _js_skip_string(src, i)
            out.append(src[i:j])
            prev, word = c, ""
            i = j
            continue
        if c == "`":
            j = _js_skip_template(src, i)
            out.append(src[i:j])
            prev, word = "`", ""
            i = j
            continue
        if c == "/" and _regex_allowed(prev, word):
            j = _js_skip_regex(src, i)
            if j > i + 1:
                out.append(src[i:j])
            prev, word = "/", ""
            i = j
            continue
        if c.isalnum() or c in "_$":
            word += c
        elif not c.isspace():
            word = ""
        if not c.isspace():
            prev = c
        i += 1
    return out


# ---------------------------------------------------------------------------
# CSS
# ---------------------------------------------------------------------------

def _css_skip_string(src, i):
    q = src[i]
    i += 1
    n = len(src)
    while i < n:
        c = src[i]
        if c == "\\":
            i += 2
            continue
        if c == q:
            return i + 1
        if c == "\n":
            return i
        i += 1
    return n


def strip_css_comments(src, keep_important=False, collect=None):
    """Retire les /* */ d'un source CSS (uniquement)."""
    out = []
    i = 0
    n = len(src)
    while i < n:
        c = src[i]
        if c == "/" and i + 1 < n and src[i + 1] == "*":
            j = src.find("*/", i + 2)
            end = n if j == -1 else j + 2
            if collect is not None:
                collect.append(src[i:end])
            if keep_important and src[i:end].startswith("/*!"):
                out.append(src[i:end])
            i = end
            continue
        if c == '"' or c == "'":
            j = _css_skip_string(src, i)
            out.append(src[i:j])
            i = j
            continue
        out.append(c)
        i += 1
    return "".join(out)


# ---------------------------------------------------------------------------
# HTML : scan des <!-- --> + traitement des <script>/<style> embarqués
# ---------------------------------------------------------------------------

def strip_html_comments(src, keep_important=False, strip_embedded=True, collect=None):
    out = []
    i = 0
    n = len(src)
    low = src.lower()
    while i < n:
        if src.startswith("<!--", i):
            j = src.find("-->", i + 4)
            if j == -1:
                out.append(src[i:])
                break
            if collect is not None:
                collect.append(src[i:j + 3])
            i = j + 3
            continue

        if low.startswith("<script", i):
            k = src.find(">", i)
            if k == -1:
                out.append(src[i:])
                break
            out.append(src[i:k + 1])
            m = low.find("</script", k + 1)
            if m == -1:
                body, i = src[k + 1:], n
            else:
                body, i = src[k + 1:m], m
            out.append(strip_js_comments(body, keep_important, collect)
                       if strip_embedded else body)
            continue

        if low.startswith("<style", i):
            k = src.find(">", i)
            if k == -1:
                out.append(src[i:])
                break
            out.append(src[i:k + 1])
            m = low.find("</style", k + 1)
            if m == -1:
                body, i = src[k + 1:], n
            else:
                body, i = src[k + 1:m], m
            out.append(strip_css_comments(body, keep_important, collect)
                       if strip_embedded else body)
            continue

        out.append(src[i])
        i += 1
    return "".join(out)


# ---------------------------------------------------------------------------
# Traitement + garde-fous
# ---------------------------------------------------------------------------

def looks_minified(text):
    lines = text.splitlines() or [""]
    avg = len(text) / len(lines)
    return avg > 300


def html_scripts_literals_ok(original, cleaned):
    pat = r"(?is)<script\b[^>]*>(.*?)</script\s*>"
    a = re.findall(pat, original)
    b = re.findall(pat, cleaned)
    if len(a) != len(b):
        return False
    return all(js_literals(x) == js_literals(y) for x, y in zip(a, b))


def process_text(path, text, args):
    """Renvoie le texte nettoyé, ou None si le garde-fou échoue."""
    ext = os.path.splitext(path)[1].lower()
    if ext in (".html", ".htm"):
        cleaned = strip_html_comments(
            text, keep_important=args.keep_important,
            strip_embedded=not args.no_embedded)
        if not args.no_embedded and not html_scripts_literals_ok(text, cleaned):
            return None
        return cleaned
    if ext in (".js", ".mjs", ".cjs"):
        cleaned = strip_js_comments(text, keep_important=args.keep_important)
        if js_literals(text) != js_literals(cleaned):
            return None
        return cleaned
    if ext == ".css":
        return strip_css_comments(text, keep_important=args.keep_important)
    return text


DEFAULT_EXTS = ("html", "htm", "js", "mjs", "cjs", "css")
SKIP_DIRS = {".git", "node_modules", "__pycache__", ".vscode", "dist", "build", ".idea"}


def main():
    ap = argparse.ArgumentParser(description="Supprime les commentaires HTML / JS / CSS.")
    ap.add_argument("path", nargs="?", default=".", help="dossier ou fichier à traiter")
    ap.add_argument("--write", action="store_true", help="écrit (sinon dry-run)")
    ap.add_argument("--keep-important", action="store_true",
                    help="garde /*! ... */ et //# sourceMappingURL")
    ap.add_argument("--no-embedded", action="store_true",
                    help="ne pas toucher aux <script>/<style> des HTML")
    ap.add_argument("--include-min", action="store_true",
                    help="inclure aussi les fichiers minifiés (déconseillé)")
    ap.add_argument("--no-backup", action="store_true", help="pas de .bak")
    ap.add_argument("--ext", default=",".join(DEFAULT_EXTS),
                    help="extensions à traiter, séparées par des virgules")
    args = ap.parse_args()

    exts = {("." + e.strip().lstrip(".")).lower() for e in args.ext.split(",") if e.strip()}

    targets = []
    if os.path.isfile(args.path):
        targets.append(args.path)
    else:
        for root, dirs, files in os.walk(args.path):
            dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
            for f in files:
                targets.append(os.path.join(root, f))

    n_files = n_changed = n_skip_min = n_skip_guard = 0
    removed_total = 0

    for path in sorted(targets):
        ext = os.path.splitext(path)[1].lower()
        if ext not in exts:
            continue
        name = os.path.basename(path).lower()
        if name.endswith((".bak",)):
            continue
        is_min_name = name.endswith(".min.js") or name.endswith(".min.css")

        try:
            with open(path, "r", encoding="utf-8", newline="") as fh:
                original = fh.read()
        except (UnicodeDecodeError, OSError) as e:
            print("  [SKIP] %s  (%s)" % (path, e))
            continue

        n_files += 1

        if not args.include_min and (is_min_name or looks_minified(original)):
            n_skip_min += 1
            print("  [MINIFIÉ, ignoré] %s" % path)
            continue

        cleaned = process_text(path, original, args)
        if cleaned is None:
            n_skip_guard += 1
            print("  [GARDE-FOU, ignoré] %s  (littéraux perdus ?)" % path)
            continue

        removed = len(original) - len(cleaned)
        if cleaned == original:
            continue

        n_changed += 1
        removed_total += removed
        print("  [%s] %s  (-%d car.)" % ("ECRIT" if args.write else "serait modifié",
                                         path, removed))
        if args.write:
            if not args.no_backup:
                with open(path + ".bak", "w", encoding="utf-8", newline="") as fh:
                    fh.write(original)
            with open(path, "w", encoding="utf-8", newline="") as fh:
                fh.write(cleaned)

    print()
    print("Fichiers analysés        : %d" % n_files)
    print("Fichiers modifiés        : %d" % n_changed)
    print("Caractères retirables    : %d" % removed_total)
    print("Ignorés (minifiés)       : %d" % n_skip_min)
    print("Ignorés (garde-fou)      : %d" % n_skip_guard)
    if not args.write:
        print("\n(Dry-run) Aucun fichier modifié. Relance avec --write pour appliquer.")
    else:
        print("\nTerminé. Sauvegardes .bak créées (sauf --no-backup).")


if __name__ == "__main__":
    sys.exit(main())
