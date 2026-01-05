#!/bin/bash

echo "🔄 Iniciando backup semanal..."

# Descargar tema actual
shopify theme pull --live

# Verificar si hay cambios
if [[ -z $(git status -s) ]]; then
  echo "✅ No hay cambios esta semana"
  exit 0
fi

# Guardar cambios
git add .
git commit -m "Backup semanal - $(date +%d/%m/%Y)"
git push origin main

# Crear tag
git tag -a "backup-$(date +%Y-W%V)" -m "Backup semana $(date +%V)"
git push origin --tags

echo "✅ Backup completado exitosamente"
