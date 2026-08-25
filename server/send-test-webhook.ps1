# Sends a correctly HMAC-signed webhook to your local Nexora server using PowerShell only.
# Usage:
#   .\send-test-webhook.ps1
#   .\send-test-webhook.ps1 force.fail

$eventType = if ($args[0]) { $args[0] } else { "payment.success" }
$eventId = "evt_" + [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()

$secret = "supersecret_change_me"  # must match WEBHOOK_SECRET in your .env

$bodyObj = [ordered]@{
    eventId = $eventId
    event   = $eventType
    source  = "powershell-script"
    amount  = 4999
}
$rawBody = $bodyObj | ConvertTo-Json -Compress

# Compute HMAC-SHA256 signature, matching src/utils/signature.js
$hmac = New-Object System.Security.Cryptography.HMACSHA256
$hmac.Key = [System.Text.Encoding]::UTF8.GetBytes($secret)
$hashBytes = $hmac.ComputeHash([System.Text.Encoding]::UTF8.GetBytes($rawBody))
$signature = ($hashBytes | ForEach-Object { $_.ToString("x2") }) -join ""

Write-Host "Sending webhook: $eventType $eventId"

try {
    $response = Invoke-RestMethod -Uri "http://127.0.0.1:4000/api/webhooks" `
        -Method Post `
        -Body $rawBody `
        -ContentType "application/json" `
        -Headers @{ "x-nexora-signature" = $signature }

    Write-Host "Response:" ($response | ConvertTo-Json -Compress)
}
catch {
    Write-Host "Error:" $_.Exception.Message
    if ($_.ErrorDetails.Message) {
        Write-Host "Details:" $_.ErrorDetails.Message
    }
}