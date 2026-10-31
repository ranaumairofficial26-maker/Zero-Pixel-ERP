Add-Type -AssemblyName System.Drawing

$srcPath = "C:/Users/USER/.gemini/antigravity/brain/931d4713-19ac-4086-9eb8-4f85ca973be7/.user_uploaded/media_1793426536034_fccffd80.jpg"
$bmp = [System.Drawing.Bitmap]::FromFile($srcPath)

# Bounding box of the board content (inside the screws)
# The logo text "ZEROPIXEL" starts around x=60 and ends around x=620, y=110 to y=250
# Let's crop x=50, y=100, width=580, height=155

$cropRect = New-Object System.Drawing.Rectangle(50, 105, 580, 140)
$cropped = New-Object System.Drawing.Bitmap($cropRect.Width, $cropRect.Height)
$g = [System.Drawing.Graphics]::FromImage($cropped)
$g.DrawImage($bmp, (New-Object System.Drawing.Rectangle(0, 0, $cropRect.Width, $cropRect.Height)), $cropRect, [System.Drawing.GraphicsUnit]::Pixel)
$g.Dispose()
$bmp.Dispose()

$outPath = "backend/ZerpPixelsCRM.Api/Assets/zeropixel_logo.png"
New-Item -ItemType Directory -Force -Path "backend/ZerpPixelsCRM.Api/Assets"
$cropped.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
$cropped.Dispose()

Write-Host "Cropped logo saved to $outPath"

