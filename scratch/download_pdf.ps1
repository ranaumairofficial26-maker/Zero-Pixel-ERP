$loginPayload = @{ email = "admin@zeropixel.com"; password = "Admin@123456" } | ConvertTo-Json
$res = Invoke-RestMethod -Uri "http://localhost:5282/api/auth/login" -Method Post -Body $loginPayload -ContentType "application/json"
$token = $res.token
Invoke-WebRequest -Uri "http://localhost:5282/api/quotations/1/pdf" -Headers @{ "Authorization" = "Bearer $token" } -OutFile "scratch/quotation_final.pdf"
$fileInfo = Get-Item "scratch/quotation_final.pdf"
Write-Host "PDF File Size: $($fileInfo.Length) bytes"

