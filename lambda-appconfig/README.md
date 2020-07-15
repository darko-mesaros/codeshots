# AWS AppConfig and Lambda Functions


### Configuration Needed:
Production version of the configuration:
```json
{
   "boolEnableLimitResults": false,
   "intResultLimit": 2,
   "language": "en",
   "chaos": false
}
```
Staging version of the configuration:
```json
{
   "boolEnableLimitResults": true,
   "intResultLimit": 5,
   "language": "sh",
   "chaos": true
}
```
