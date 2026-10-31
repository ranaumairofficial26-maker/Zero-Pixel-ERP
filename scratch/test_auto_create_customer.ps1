$loginPayload = @{
    email = "admin@zeropixel.com"
    password = "Admin@123456"
} | ConvertTo-Json

$loginRes = Invoke-RestMethod -Uri "http://localhost:5282/api/auth/login" -Method Post -Body $loginPayload -ContentType "application/json"
$token = $loginRes.token
$headers = @{ "Authorization" = "Bearer $token" }

$randomSuffix = Get-Random -Minimum 10000 -Maximum 99999
$custName = "Auto Tech Corp $randomSuffix"
$custPhone = "+92 345 $randomSuffix"

Write-Host "Testing auto-create customer with Name: $custName, Phone: $custPhone"

# Create quotation with NO clientId (null)
$createPayload = @{
    clientId = $null
    customerName = $custName
    contactPerson = "Usman Tariq"
    customerPhone = $custPhone
    customerEmail = "usman@autotech$randomSuffix.pk"
    customerAddress = "Gulberg III, Lahore"
    quotationType = "Digital Marketing"
    currency = "PKR"
    quotationDate = (Get-Date).ToString("yyyy-MM-dd")
    validUntil = (Get-Date).AddDays(15).ToString("yyyy-MM-dd")
    discountType = "None"
    discountValue = 0
    taxRate = 0
    items = @(
        @{
            sortOrder = 1
            itemType = "Service"
            productName = "Digital Marketing Campaign"
            serviceCategory = "Marketing"
            serviceDetails = (@{ postsCount = 15; videoCount = 6 } | ConvertTo-Json -Compress)
            quantity = 1
            unit = "month"
            unitPrice = 90000
        }
    )
} | ConvertTo-Json -Depth 5

$quoteRes = Invoke-RestMethod -Uri "http://localhost:5282/api/quotations" -Method Post -Body $createPayload -Headers $headers -ContentType "application/json"
$quotationId = $quoteRes.quotationId
$quotationNo = $quoteRes.quotationNumber
$resolvedClientId = $quoteRes.clientId

Write-Host "Quotation created: $quotationNo (ID: $quotationId), ClientId: $resolvedClientId"

if ($resolvedClientId -and $resolvedClientId -gt 0) {
    Write-Host "SUCCESS: Quotation was automatically assigned ClientId: $resolvedClientId"
} else {
    Write-Error "FAILED: ClientId was not auto-assigned!"
}

# Now verify the customer exists in Customers module
$clientRes = Invoke-RestMethod -Uri "http://localhost:5282/api/clients/$resolvedClientId" -Method Get -Headers $headers
Write-Host "Retrieved Client from /api/clients/$resolvedClientId :"
Write-Host " - Company Name: $($clientRes.companyName)"
Write-Host " - Phone: $($clientRes.phone)"
Write-Host " - Email: $($clientRes.email)"

if ($clientRes.companyName -eq $custName -and $clientRes.phone -eq $custPhone) {
    Write-Host "SUCCESS: Customer was automatically created in Customers Directory with matching data!"
} else {
    Write-Error "FAILED: Customer data did not match!"
}

# Verify PDF generation
$pdfBytes = Invoke-RestMethod -Uri "http://localhost:5282/api/quotations/$quotationId/pdf" -Method Get -Headers $headers
$pdfHeader = [System.Text.Encoding]::ASCII.GetString($pdfBytes[0..4])
Write-Host "PDF Header: $pdfHeader, Length: $($pdfBytes.Length)"
if ($pdfHeader -eq "%PDF-") {
    Write-Host "SUCCESS: PDF Preview/Download verified successfully!"
} else {
    Write-Error "FAILED: Invalid PDF header"
}

