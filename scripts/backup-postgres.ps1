param(
  [string]$BackupDirectory = $env:BACKUP_DIR
)

if (-not $env:DATABASE_URL) { throw "DATABASE_URL is required." }
if (-not $BackupDirectory) { throw "Set BACKUP_DIR or pass -BackupDirectory." }

$resolvedDirectory = [System.IO.Path]::GetFullPath($BackupDirectory)
New-Item -ItemType Directory -Force -Path $resolvedDirectory | Out-Null
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$outputFile = Join-Path $resolvedDirectory "tramitexfederal-$timestamp.dump"

& pg_dump --format=custom --file=$outputFile $env:DATABASE_URL
if ($LASTEXITCODE -ne 0) { throw "pg_dump failed." }
Write-Output "Backup created: $outputFile"
