$connStr = "Host=localhost;Port=5432;Database=ZeroPixelErpDb;Username=postgres;Password=1234"
# Using npgsql from bin folder
$dllPath = (Resolve-Path "backend/ZerpPixelsCRM.Api/bin/Debug/net8.0/Npgsql.dll").Path
[System.Reflection.Assembly]::LoadFrom($dllPath) | Out-Null

$conn = New-Object Npgsql.NpgsqlConnection($connStr)
$conn.Open()

$cmd = $conn.CreateCommand()
$cmd.CommandText = @"
SELECT 
    q.quotation_id, 
    q.quotation_number, 
    q.customer_name, 
    q.customer_phone, 
    q.quotation_type, 
    r.revision_number,
    r.status, 
    r.grand_total, 
    q.created_at
FROM quotations q
LEFT JOIN quotation_revisions r ON r.quotation_id = q.quotation_id AND r.revision_number = (
    SELECT MAX(revision_number) FROM quotation_revisions WHERE quotation_id = q.quotation_id
)
ORDER BY q.quotation_id DESC;
"@

$reader = $cmd.ExecuteReader()
$table = New-Object System.Data.DataTable
$table.Load($reader)
$conn.Close()

$table | Format-Table -AutoSize

