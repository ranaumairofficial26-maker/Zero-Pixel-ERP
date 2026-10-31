$loginPayload = @{
    email = "admin@zeropixel.com"
    password = "Admin@123456"
} | ConvertTo-Json

$loginRes = Invoke-RestMethod -Uri "http://localhost:5282/api/auth/login" -Method Post -Body $loginPayload -ContentType "application/json"
$token = $loginRes.token
$headers = @{ "Authorization" = "Bearer $token" }

# Fetch PDF for quotation 1
$pdfBytes = Invoke-RestMethod -Uri "http://localhost:5282/api/quotations/1/pdf" -Method Get -Headers $headers
$pdfHeader = [System.Text.Encoding]::ASCII.GetString($pdfBytes[0..4])
Write-Host "PDF Header: $pdfHeader, Length: $($pdfBytes.Length)"

[System.IO.File]::WriteAllBytes("scratch/quotation_with_new_logo.pdf", $pdfBytes)
Write-Host "PDF saved to scratch/quotation_with_new_logo.pdf"

