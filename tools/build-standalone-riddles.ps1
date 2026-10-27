[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$siteRoot = Split-Path -Parent $PSScriptRoot
$puzzlesRoot = Join-Path $siteRoot 'dist\puzzles'
$outputRoot = Join-Path $siteRoot 'standalone-riddles'

if (-not (Test-Path -LiteralPath $puzzlesRoot -PathType Container)) {
  throw "Puzzle source directory was not found: $puzzlesRoot"
}

if (-not (Test-Path -LiteralPath $outputRoot -PathType Container)) {
  New-Item -ItemType Directory -Path $outputRoot | Out-Null
}

$responsiveCss = [IO.File]::ReadAllText((Join-Path $puzzlesRoot 'responsive-riddles.css'))
$responsiveOriginalCss = [IO.File]::ReadAllText((Join-Path $puzzlesRoot 'responsive-riddles-original.css'))
$responsiveJs = [IO.File]::ReadAllText((Join-Path $puzzlesRoot 'responsive-riddles.js'))
$filenameStatement = '  const filename = decodeURIComponent(location.pathname.split("/").pop() || "").replace(/\.html$/i, "");'
$utf8NoBom = [Text.UTF8Encoding]::new($false)

function ConvertFrom-Utf8Base64([string]$Value) {
  return [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($Value))
}

$riddles = @(
  [pscustomobject]@{ Source = 'dendritic-riddle-1.html'; Id = 'dendritic-riddle-1'; OutputBase64 = '16fXldee15QgMSAtINeX15nXk9eUIDEgLSDXkNeZ16rXnyDXldei157XmdeqLmh0bWw=' }
  [pscustomobject]@{ Source = 'dendritic-riddle-2.html'; Id = 'dendritic-riddle-2'; OutputBase64 = '16fXldee15QgMSAtINeX15nXk9eUIDIgLSDXlNeb15PXldeo16HXnNefLmh0bWw=' }
  [pscustomobject]@{ Source = 'dendritic-riddle-3.html'; Id = 'dendritic-riddle-3'; OutputBase64 = '16fXldee15QgMSAtINeX15nXk9eUIDMgLSDXlNep15nXqNeZ150g15TXkNeU15XXkdeZ150uaHRtbA==' }
  [pscustomobject]@{ Source = 'dendritic-riddle-4.html'; Id = 'dendritic-riddle-4'; OutputBase64 = '16fXldee15QgMSAtINeX15nXk9eUIDQgLSDXlNen15XXoyDXkdeS17PXldeg15LXnC5odG1s' }
  [pscustomobject]@{ Source = 'floor2\skin-temperature.html'; Id = 'skin-temperature'; OutputBase64 = '16fXldee15QgMiAtINeX15nXk9eUIDEgLSDXpNei16DXldeXINeY157XpNeo15jXldeo16og15TXoteV16guaHRtbA==' }
  [pscustomobject]@{ Source = 'floor2\movement-direction.html'; Id = 'movement-direction'; OutputBase64 = '16fXldee15QgMiAtINeX15nXk9eUIDIgLSDXpNei16DXldeXINeb15nXldeV158g15TXqteg15XXoteULmh0bWw=' }
  [pscustomobject]@{ Source = 'floor2\hippocampal-object-neuron.html'; Id = 'hippocampal-object-neuron'; OutputBase64 = '16fXldee15QgMiAtINeX15nXk9eUIDMgLSDXoNeV15nXqNeV158g15DXldeR15nXmden15jXmdedINeR15TXmdek15XXp9ee16TXldehLmh0bWw=' }
  [pscustomobject]@{ Source = 'floor2\language-neuron.html'; Id = 'language-neuron'; OutputBase64 = '16fXldee15QgMiAtINeX15nXk9eUIDQgLSDXpNei16DXldeXINek16LXmdec15XXqiDXoNeV15nXqNeV158g15TXqdek15QuaHRtbA==' }
  [pscustomobject]@{ Source = 'floor3\mouse-place-cells.html'; Id = 'mouse-place-cells'; OutputBase64 = '16fXldee15QgMyAtINeX15nXk9eUIDEgLSDXqteQ15kg157Xmden15XXnS5odG1s' }
  [pscustomobject]@{ Source = 'floor3\wormmind.html'; Id = 'wormmind'; OutputBase64 = '16fXldee15QgMyAtINeX15nXk9eUIDIgLSDXnteV15csINeX15nXldeV15gg15XXlNeq16DXlNeS15XXqi5odG1s' }
)

$cssLinkPattern = '<link\b(?=[^>]*\bhref\s*=\s*["''][^"'']*responsive-riddles(?:-original)?\.css(?:\?[^"'']*)?["''])[^>]*>'
$jsTagPattern = '<script\b(?=[^>]*\bsrc\s*=\s*["''][^"'']*responsive-riddles\.js(?:\?[^"'']*)?["''])[^>]*>\s*</script>'

foreach ($riddle in $riddles) {
  $outputName = ConvertFrom-Utf8Base64 $riddle.OutputBase64
  $sourcePath = Join-Path $puzzlesRoot $riddle.Source
  $outputPath = Join-Path $outputRoot $outputName
  $html = [IO.File]::ReadAllText($sourcePath)

  $logicalTitle = [IO.Path]::GetFileNameWithoutExtension($outputName)
  $titleRegex = [regex]::new('<title>.*?</title>', [Text.RegularExpressions.RegexOptions]::IgnoreCase)
  if ($titleRegex.Matches($html).Count -lt 1) {
    throw "Expected a document title in $($riddle.Source)."
  }
  $html = $titleRegex.Replace($html, "<title>$logicalTitle</title>", 1)

  $bodyRegex = [regex]::new('<body\b(?![^>]*\bdata-riddle\s*=)[^>]*>', [Text.RegularExpressions.RegexOptions]::IgnoreCase)
  $bodyMatch = $bodyRegex.Match($html)
  if (-not $bodyMatch.Success) {
    throw "Could not add the canonical riddle identifier in $($riddle.Source)."
  }
  $bodyTag = $bodyMatch.Value.Insert($bodyMatch.Value.Length - 1, " data-riddle=`"$($riddle.Id)`"")
  $html = $bodyRegex.Replace($html, $bodyTag, 1)

  if ($riddle.Id -eq 'skin-temperature') {
    $html = [regex]::Replace(
      $html,
      '(?m)^\s*@import\s+url\(["'']https://fonts\.googleapis\.com/[^)]*\)[^;]*;\s*$\r?\n?',
      ''
    )
  }

  $cssMatches = [regex]::Matches($html, $cssLinkPattern, [Text.RegularExpressions.RegexOptions]::IgnoreCase)
  if ($cssMatches.Count -ne 1) {
    throw "Expected one shared stylesheet in $($riddle.Source), found $($cssMatches.Count)."
  }

  $css = if ($cssMatches[0].Value -match 'responsive-riddles-original\.css') {
    $responsiveOriginalCss
  } else {
    $responsiveCss
  }
  $styleTag = "<style data-standalone-responsive>`r`n$css`r`n</style>"
  $html = [regex]::Replace(
    $html,
    $cssLinkPattern,
    [Text.RegularExpressions.MatchEvaluator]{ param($match) $styleTag },
    [Text.RegularExpressions.RegexOptions]::IgnoreCase
  )

  $jsMatches = [regex]::Matches($html, $jsTagPattern, [Text.RegularExpressions.RegexOptions]::IgnoreCase)
  if ($jsMatches.Count -ne 1) {
    throw "Expected one shared responsive script in $($riddle.Source), found $($jsMatches.Count)."
  }
  $html = [regex]::Replace($html, $jsTagPattern, '', [Text.RegularExpressions.RegexOptions]::IgnoreCase)

  $standaloneJs = $responsiveJs.Replace($filenameStatement, "  const filename = `"$($riddle.Id)`";")
  if ($standaloneJs -eq $responsiveJs) {
    throw 'Could not pin the original riddle identifier in the shared responsive script.'
  }
  $scriptTag = "`r`n<script data-standalone-responsive>`r`n$standaloneJs`r`n</script>`r`n"
  $bodyClose = $html.LastIndexOf('</body>', [StringComparison]::OrdinalIgnoreCase)
  if ($bodyClose -lt 0) {
    throw "Closing body tag was not found in $($riddle.Source)."
  }
  $html = $html.Insert($bodyClose, $scriptTag)

  if ($html -match '(?:href|src)\s*=\s*["''][^"'']*responsive-riddles') {
    throw "A shared local dependency remains in $($riddle.Source)."
  }

  [IO.File]::WriteAllText($outputPath, $html, $utf8NoBom)
  [pscustomobject]@{
    File = $outputName
    Bytes = ([IO.FileInfo]$outputPath).Length
  }
}
