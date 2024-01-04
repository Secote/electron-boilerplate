$filePath = ".hasplm/hasp_xxxxx.ini"

New-Item -Path ".hasplm" -ItemType Directory -ErrorAction SilentlyContinue

$formattedAddresses  = @(
    "requestlog=1",
    "errorlog=1",
    "broadcastsearch=1"
)
$ipv4Addresses = Get-NetIPAddress -AddressFamily IPv4 | Select-Object -ExpandProperty IPAddress
$formattedAddresses += $ipv4Addresses | ForEach-Object {
    "serveraddr=$_"
}

# Write the formatted addresses to the specified file
$formattedAddresses | Set-Content -Path $filePath

# Display a message indicating that the addresses have been saved
Write-Host "Formatted addresses have been saved to $filePath"


docker-compose -f docker-compose.deploy.yml down
docker-compose -f docker-compose.deploy.yml up -d
docker system prune -f
