# This script adds Git to your terminal's PATH for the current session.
# Run this by typing .\setup-git.ps1 in your terminal.

$gitPath = "C:\Program Files\Git\bin"
$gitCmdPath = "C:\Program Files\Git\cmd"

if (Test-Path $gitPath) {
    $env:Path += ";$gitPath;$gitCmdPath"
    Write-Host "✅ Git has been successfully added to your PATH for this session." -ForegroundColor Green
    Write-Host "You can now run 'git add .', 'git commit', and 'git push'."
} else {
    Write-Host "❌ Git was not found at $gitPath." -ForegroundColor Red
    Write-Host "Please ensure Git is installed or check your installation path."
}
