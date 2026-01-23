# Test Brevo Email API via PowerShell

$uri = "http://localhost:3000/api/email/test"
$body = @{ email = "eventflow.ynov@hotmail.com" } | ConvertTo-Json
$headers = @{ "Content-Type" = "application/json" }

Write-Host "Testing email endpoint..." -ForegroundColor Cyan
Write-Host "URL: $uri" -ForegroundColor Gray

try {
    $response = Invoke-WebRequest -Uri $uri -Method POST -Body $body -Headers $headers -ErrorAction Stop
    Write-Host "SUCCESS!" -ForegroundColor Green
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host ""
    $response.Content | ConvertFrom-Json | ConvertTo-Json
}
catch {
    Write-Host "ERROR!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}
