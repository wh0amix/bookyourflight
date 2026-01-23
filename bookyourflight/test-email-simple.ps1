# Test simple de l'endpoint email
Write-Host "Testing email endpoint..." -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/email/test" `
        -Method POST `
        -ContentType "application/json" `
        -Body (@{ email = "eventflow.ynov@hotmail.com" } | ConvertTo-Json)

    Write-Host "SUCCESS!" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Yellow
    $response | ConvertTo-Json -Depth 10
}
catch {
    Write-Host "ERROR!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response body:" -ForegroundColor Yellow
        Write-Host $responseBody
    }
}
