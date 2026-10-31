Add-Type -AssemblyName System.Drawing

$srcPath = "C:/Users/USER/.gemini/antigravity/brain/931d4713-19ac-4086-9eb8-4f85ca973be7/.user_uploaded/media_1793426536034_fccffd80.jpg"
$bmp = [System.Drawing.Bitmap]::FromFile($srcPath)

$minX = $bmp.Width
$maxX = 0
$minY = $bmp.Height
$maxY = 0

# We ignore the outer 60 pixels to avoid the 4 screws
for ($x = 60; $x -lt ($bmp.Width - 60); $x++) {
    for ($y = 80; $y -lt ($bmp.Height - 80); $y++) {
        $c = $bmp.GetPixel($x, $y)
        # Text pixels have significant saturation (blue) or low brightness (black)
        $isDark = ($c.R -lt 210 -and $c.G -lt 210 -and $c.B -lt 210)
        $isBlue = ($c.B -gt 150 -and $c.R -lt 100)
        if ($isDark -or $isBlue) {
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($y -gt $maxY) { $maxY = $y }
        }
    }
}

Write-Host "Exact text bounds: X: $minX to $maxX, Y: $minY to $maxY"
$bmp.Dispose()

