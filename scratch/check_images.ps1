Add-Type -AssemblyName System.Drawing

$filePath1 = "frontend/src/assets/logo.png"
$img1 = [System.Drawing.Image]::FromFile((Resolve-Path $filePath1))
Write-Host "logo.png: $($img1.Width) x $($img1.Height)"
$img1.Dispose()

$uploadedPath = "C:/Users/USER/.gemini/antigravity/brain/931d4713-19ac-4086-9eb8-4f85ca973be7/.user_uploaded/media_1793426536034_fccffd80.jpg"
$img2 = [System.Drawing.Image]::FromFile($uploadedPath)
Write-Host "uploaded jpg: $($img2.Width) x $($img2.Height)"
$img2.Dispose()

