# Check if Docker is logged in, if logged in this line exists with 53 characters.
$dockerConfig = Get-Content "$env:USERPROFILE\.docker\config.json"
Write-Host $dockerConfig
$findTarget = ($dockerConfig | Select-String 'swr.cn-east-3.myhuaweicloud.com').Length

if ($findTarget -eq 1) {
    Write-Host "Docker is logged in"
}
else {
    # Prompt the user for access key
    $accessKey = Read-Host "Enter your access key"

    # Prompt the user for a secretAccessKey
    $secretAccessKey = Read-Host "Enter your secretAccessKey"

    # Check if both access key and secretAccessKey are provided
    if ([string]::IsNullOrWhiteSpace($accessKey) -or [string]::IsNullOrWhiteSpace($secretAccessKey)) {
        Write-Host "Access key and secretAccessKey are required."
        exit 1
    }

    # Generate password for docker login
    $hmacsha256 = New-Object System.Security.Cryptography.HMACSHA256
    $hmacsha256.Key = [System.Text.Encoding]::UTF8.GetBytes($secretAccessKey)
    $password = $hmacsha256.ComputeHash([System.Text.Encoding]::UTF8.GetBytes($accessKey))
    $passwordHex = ([BitConverter]::ToString($password) -replace '-').ToLower()
    Write-Host $passwordHex
    # Login to docker registry
    docker login -u cn-east-3@$accessKey -p $passwordHex swr.cn-east-3.myhuaweicloud.com
}

# Pull Docker images
docker pull swr.cn-east-3.myhuaweicloud.com/secote/annotation_ui:standard
docker pull swr.cn-east-3.myhuaweicloud.com/secote/annotation_ui:latest
docker pull swr.cn-east-3.myhuaweicloud.com/secote/annotation_server:latest
docker pull swr.cn-east-3.myhuaweicloud.com/secote/fiftyone:latest
docker pull swr.cn-east-3.myhuaweicloud.com/secote/server:latest
docker pull swr.cn-east-3.myhuaweicloud.com/secote/ml_engine:latest
docker pull swr.cn-east-3.myhuaweicloud.com/secote/mongodb:latest
docker pull swr.cn-east-3.myhuaweicloud.com/secote/alpine:3.15
docker image tag swr.cn-east-3.myhuaweicloud.com/secote/alpine:3.15 gcr.io/iguazio/alpine:3.15