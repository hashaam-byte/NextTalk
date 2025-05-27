# Add Fly.io to PATH
$flyPath = "$env:USERPROFILE\.fly\bin"
$currentPath = [Environment]::GetEnvironmentVariable("PATH", "User")

if ($currentPath -notlike "*$flyPath*") {
    [Environment]::SetEnvironmentVariable("PATH", "$currentPath;$flyPath", "User")
    Write-Host "Added Fly.io to PATH"
}

# Test the installation
Write-Host "Testing Fly.io installation..."
fly version

# Login to Fly.io
Write-Host "Logging in to Fly.io..."
fly auth login
