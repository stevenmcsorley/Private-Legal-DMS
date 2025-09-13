# Detection Queries (Loki/LogQL) — Private Legal DMS

## Repeated Access Denials (401/403)
```
{app="api"} |= "HTTP" |~ " 401 | 403 " | unwrap ts | rate(5m)
```

## OPA Denies by Policy
```
{app="opa"} |= "decision" | json | policy != "" | line_format "{{.input.user.id}} {{.result}}" 
```

## Suspicious Token Use (multiple IPs per session)
```
{app="gateway"} |= "Cookie: session" | pattern "<ip> - - * session=<sid>" | count_over_time(1h) by (sid, ip)
```

## MinIO Presigned URL Abuse
```
{app="minio"} |= "presigned" |= "GET" | json | rate(5m)
```

## ClamAV Detections
```
{app="clamav"} |= "FOUND" | json | count_over_time(1h)
```
