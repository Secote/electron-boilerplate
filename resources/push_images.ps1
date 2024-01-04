# Generate password for docker login
# Define the input data and the HMAC key
# $inputData = "ETFK5L9R00BVSOMOLK9E"
# $hmacKey = "Y6Lrvj8O9gGBaIUxZgX0i86SyhxmPoALPLMQV12E"
# Generate password for docker login
# Define the input data and the HMAC key
$accessKeyId = Read-Host -Prompt "Enter the Access Key Id"
$secretAccessKey = Read-Host -Prompt "Enter the Secret Access Key"
# $accessKeyId = "ETFK5L9R00BVSOMOLK9E"
# $secretAccessKey = "Y6Lrvj8O9gGBaIUxZgX0i86SyhxmPoALPLMQV12E"

# Convert input data and HMAC key to byte arrays
$inputBytes = [System.Text.Encoding]::UTF8.GetBytes($accessKeyId)
$keyBytes = [System.Text.Encoding]::UTF8.GetBytes($secretAccessKey)

# Calculate HMAC-SHA256
$hmacSha256 = New-Object System.Security.Cryptography.HMACSHA256
$hmacSha256.Key = $keyBytes
$hashBytes = $hmacSha256.ComputeHash($inputBytes)

# Convert the hash bytes to a hexadecimal string
$password = -join ($hashBytes | ForEach-Object { $_.ToString("x2") })
$password = $password.ToLower()
# Display the result
Write-Output $password
# Login to docker registry
docker login -u cn-east-3@$accessKeyId -p $password swr.cn-east-3.myhuaweicloud.com

docker push swr.cn-east-3.myhuaweicloud.com/secote/fiftyone:latest
docker push swr.cn-east-3.myhuaweicloud.com/secote/server:latest
docker push swr.cn-east-3.myhuaweicloud.com/secote/ml_engine:latest
docker push swr.cn-east-3.myhuaweicloud.com/secote/mongodb:latest
docker push swr.cn-east-3.myhuaweicloud.com/secote/annotation_ui:latest
docker push swr.cn-east-3.myhuaweicloud.com/secote/annotation_server:latest

