param(
    [string]$Urls = "http://localhost:5282",
    [string]$Environment = "Development"
)

$binDir = "D:\Zerp pixels crm\backend\ZerpPixelsCRM.Api\bin\Debug\net8.0"
Set-Location -Path $binDir

$env:ASPNETCORE_URLS = $Urls
$env:ASPNETCORE_ENVIRONMENT = $Environment
$env:DOTNET_ENVIRONMENT = $Environment

# Register assembly resolve handler so dependencies in the bin dir are loaded into memory as well
[System.AppDomain]::CurrentDomain.add_AssemblyResolve({
    param($sender, $args)
    $name = $args.Name.Split(',')[0]
    $candidate = Join-Path $binDir "$name.dll"
    if (Test-Path $candidate) {
        return [System.Reflection.Assembly]::Load([System.IO.File]::ReadAllBytes($candidate))
    }
    return $null
})

# Load main assembly
$mainDll = Join-Path $binDir "ZerpPixelsCRM.Api.dll"
$bytes = [System.IO.File]::ReadAllBytes($mainDll)
$asm = [System.Reflection.Assembly]::Load($bytes)

Write-Host "Assembly loaded successfully: $($asm.FullName)"
$entry = $asm.EntryPoint
Write-Host "Invoking EntryPoint: $($entry.DeclaringType.FullName).$($entry.Name)"

$argsArray = [string[]]@("--urls", $Urls, "--environment", $Environment)
if ($entry.GetParameters().Length -eq 0) {
    $entry.Invoke($null, @())
} else {
    $entry.Invoke($null, @(,$argsArray))
}

