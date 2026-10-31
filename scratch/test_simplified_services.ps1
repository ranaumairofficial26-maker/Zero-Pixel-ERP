$loginPayload = @{
    email = "admin@zeropixel.com"
    password = "Admin@123456"
} | ConvertTo-Json

$loginRes = Invoke-RestMethod -Uri "http://localhost:5282/api/auth/login" -Method Post -Body $loginPayload -ContentType "application/json"
$token = $loginRes.token
Write-Host "Auth successful! Token acquired."

$headers = @{
    "Authorization" = "Bearer $token"
}

# Create quotation with Website and Marketing
$createPayload = @{
    customerName = "Crown Digital Solutions"
    contactPerson = "Naveed Ahmad"
    customerPhone = "+92 300 9876543"
    customerEmail = "naveed@crowndigital.pk"
    customerAddress = "Phase 5, DHA, Lahore"
    quotationType = "Digital Marketing"
    currency = "PKR"
    quotationDate = (Get-Date).ToString("yyyy-MM-dd")
    validUntil = (Get-Date).AddDays(15).ToString("yyyy-MM-dd")
    discountType = "Percentage"
    discountValue = 5
    taxRate = 0
    internalNotes = "Internal developer costs verified"
    customerNotes = "Complete digital presence package"
    termsAndConditions = "1. 50% advance.\n2. Delivery within 3 weeks."
    items = @(
        @{
            sortOrder = 1
            itemType = "Service"
            productName = "Custom Corporate Website"
            serviceCategory = "Website"
            serviceDetails = (@{ pagesCount = 8 } | ConvertTo-Json -Compress)
            description = "Custom Angular & .NET portal with WhatsApp integration"
            quantity = 1
            unit = "project"
            unitPrice = 75000
        },
        @{
            sortOrder = 2
            itemType = "Service"
            productName = "Monthly Growth Marketing"
            serviceCategory = "Marketing"
            serviceDetails = (@{
                postsCount = 20
                videoCount = 8
            } | ConvertTo-Json -Compress)
            description = "Monthly marketing posts and reels management"
            quantity = 1
            unit = "month"
            unitPrice = 85000
        }
    )
} | ConvertTo-Json -Depth 5

$createRes = Invoke-RestMethod -Uri "http://localhost:5282/api/quotations" -Method Post -Body $createPayload -Headers $headers -ContentType "application/json"
$quotationId = $createRes.quotationId
$quotationNo = $createRes.quotationNumber
Write-Host "Quotation created: $quotationNo (ID: $quotationId)"

# Finalize Quotation
$finalizeRes = Invoke-RestMethod -Uri "http://localhost:5282/api/quotations/$quotationId/finalize" -Method Post -Headers $headers
Write-Host "Revision finalized: Revision $($finalizeRes.activeRevision.revisionNumber), Status: $($finalizeRes.activeRevision.status)"

# Fetch Details
$detailsRes = Invoke-RestMethod -Uri "http://localhost:5282/api/quotations/$quotationId" -Method Get -Headers $headers
Write-Host "Active Revision Items count: $($detailsRes.activeRevision.items.Count)"
foreach ($item in $detailsRes.activeRevision.items) {
    Write-Host " - Item: $($item.productName), Category: $($item.serviceCategory), Details: $($item.serviceDetails), Rate: $($item.unitPrice)"
}

# Download PDF and verify
$pdfBytes = Invoke-RestMethod -Uri "http://localhost:5282/api/quotations/$quotationId/pdf" -Method Get -Headers $headers
$pdfHeader = [System.Text.Encoding]::ASCII.GetString($pdfBytes[0..4])
Write-Host "PDF Header bytes: $pdfHeader"
Write-Host "PDF Byte Length: $($pdfBytes.Length)"

if ($pdfHeader -eq "%PDF-") {
    Write-Host "SUCCESS: PDF generated correctly with valid header!"
} else {
    Write-Error "FAILED: Invalid PDF header: $pdfHeader"
}
