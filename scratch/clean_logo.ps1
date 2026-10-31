Add-Type -AssemblyName System.Drawing

$srcPath = "C:/Users/USER/.gemini/antigravity/brain/931d4713-19ac-4086-9eb8-4f85ca973be7/.user_uploaded/media_1793426536034_fccffd80.jpg"
$src = [System.Drawing.Bitmap]::FromFile($srcPath)

$pad = 6
$cropX = [Math]::Max(0, 61 - $pad)
$cropY = [Math]::Max(0, 116 - $pad)
$cropW = (615 - 61) + ($pad * 2)
$cropH = (247 - 116) + ($pad * 2)

$outBmp = New-Object System.Drawing.Bitmap($cropW, $cropH, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

for ($x = 0; $x -lt $cropW; $x++) {
    for ($y = 0; $y -lt $cropH; $y++) {
        $c = $src.GetPixel($cropX + $x, $cropY + $y)
        
        $r = [int]$c.R
        $g = [int]$c.G
        $b = [int]$c.B
        $diffRG = [Math]::Abs($r - $g)
        $diffRB = [Math]::Abs($r - $b)
        $diffGB = [Math]::Abs($g - $b)

        # Detect background: bright and neutral (not blue, not dark)
        $isBackground = ($r -gt 215 -and $g -gt 215 -and $b -gt 215 -and $diffRG -lt 25 -and $diffRB -lt 25 -and $diffGB -lt 25)

        if ($isBackground) {
            # Pure transparent
            $outBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 255, 255, 255))
        } else {
            # Foreground pixel
            # Check if it's dark/black text
            if ($r -lt 80 -and $g -lt 80 -and $b -lt 80) {
                # Clean rich black
                $outBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(255, 15, 23, 42))
            } elseif ($b -gt $r + 30) {
                # Vibrant ZeroPixel Brand Blue
                $outBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(255, 0, 153, 221))
            } else {
                # Anti-aliasing edge pixel
                $brightness = ($r + $g + $b) / 3.0
                if ($brightness -gt 225) {
                    $outBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 255, 255, 255))
                } else {
                    $alpha = [int]([Math]::Max(0, [Math]::Min(255, (255 - $brightness) * 1.5)))
                    $outBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($alpha, $r, $g, $b))
                }
            }
        }
    }
}

$src.Dispose()

$assetsDir = "backend/ZerpPixelsCRM.Api/Assets"
if (!(Test-Path $assetsDir)) { New-Item -ItemType Directory -Force -Path $assetsDir }

$outPng = "$assetsDir/zeropixel_logo.png"
$outBmp.Save($outPng, [System.Drawing.Imaging.ImageFormat]::Png)
$outBmp.Dispose()

Write-Host "Processed transparent logo saved to: $outPng"

