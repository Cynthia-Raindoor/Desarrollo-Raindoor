Backup del tema (manual)

Resumen
-------
Este directorio contiene `backup-theme.ps1`, un script PowerShell para obtener una copia del tema publicado con Shopify CLI y subirla a la rama `theme-backups` de tu repositorio.

Requisitos previos
------------------
- Shopify CLI instalado y estar autenticado: `shopify login --store your-store.myshopify.com`
- Git configurado y remoto `origin` apuntando a tu repo en GitHub
- Opcional: establecer variable de entorno `THEME_ID` con el id del theme

Uso (manual)
------------
1. Abre PowerShell y navega al repositorio (donde está `scripts/`):
   cd C:\path\to\repo
2. (Opcional) Exporta la variable THEME_ID en la sesión:
   $env:THEME_ID = '123456789'
3. Ejecuta el script:
   powershell -ExecutionPolicy Bypass -File .\scripts\backup-theme.ps1

Programación (Task Scheduler)
-----------------------------
1. Abre Task Scheduler → Create Basic Task
2. Trigger: Weekly → elige día y hora
3. Action: Start a program
   - Program/script: powershell.exe
   - Add arguments: -ExecutionPolicy Bypass -File "C:\path\to\repo\scripts\backup-theme.ps1"
   - Start in: C:\path\to\repo
4. Save. Prueba ejecutar la tarea manualmente para verificar permisos.

Notas de seguridad
------------------
- No pongas credenciales en el script. Haz `shopify login` de forma interactiva.
- Protege la rama `theme-backups` si no quieres pushes accidentales.

Verificación / restauración
--------------------------
- Revisa `git log` en la rama `theme-backups` para ver los backups.
- Para restaurar, checkout de la versión deseada y usar `shopify theme push --theme-id=<THEME_ID>` (probar en un theme de preview antes de publicar).