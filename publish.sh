#!/usr/bin/env bash
# Сохраняет все изменения и отправляет их на GitHub.
# Первый раз: REPO_URL=https://github.com/you/repo.git ./publish.sh "первая версия"
# Дальше:     ./publish.sh "что изменилось"
set -e
MSG="${1:-Обновление приложения}"
if [ ! -d .git ]; then
  git init -b main
  git remote add origin "${REPO_URL:?Укажите адрес репозитория: REPO_URL=https://github.com/you/repo.git ./publish.sh}"
fi
git add -A
if git diff --cached --quiet; then
  echo "Нет изменений для отправки."
  exit 0
fi
git commit -m "$MSG"
git push -u origin main
echo "Готово. GitHub Pages обновится через 1–2 минуты."
