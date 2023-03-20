# OpenAPI-to-S3


## Summary
The utility has been developed to work in tandem with [openAPI-renderer](https://github.com/velmie/openAPI-renderer). 

It provides a convenient way to deliver OpenAPI specifications to AWS S3 in a correct structure

**Supported specification formats**:
* Swagger 2.0 schema (yaml)
* OpenAPI 3.0 schema (yaml) ("3.0.0", "3.0.1", "3.0.2", "3.0.3", "3.1.0")

## Requirements

* Node.js **12.x** or higher
* npm **7+**

## Install

```js
npm i -g openapi-to-s3
```

## Usage

After the installation, there are two aliases available:

1. openapi-to-s3
2. api2s3

### AWS credentials

The utility expects that AWS credentials have already been configured.

It works both with [ENV Variables](https://docs.aws.amazon.com/sdk-for-php/v3/developer-guide/guide_credentials_environment.html) and [Credential Profiles](https://docs.aws.amazon.com/sdk-for-php/v3/developer-guide/guide_credentials_profiles.html) 

### Options

**Mandatory**:

* ``--src`` - The path to the source '*OpenAPI*' file
* ``--s3-path`` - The destination path on AWS S3. Format: ``bucket/stage/service-name``
* ``--label`` - The label for the current version of the 'OpenAPI' file

**Optional**:

* ``--only-diff`` - Checks the previously uploaded file and uploads a new one only if there are any differences between them
* ``--keep-only`` - Keeps only **N** the latest documents on AWS S3 (default: unlimited)
* ``--verbose`` - Shows errors, warnings, etc.

### AWS IAM policy

There is a sample of the policy that can be used to provide the access to ``AWS S3``

Don't forget to replace ``bucket-for-openapi-docs`` with your S3 bucket name.

```JSON
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Action": [
                "s3:ListBucket",
                "s3:GetBucketAcl"
            ],
            "Resource": [
                "arn:aws:s3:::bucket-for-openapi-docs"
            ],
            "Effect": "Allow"
        },
        {
            "Action": [
                "s3:GetObject",
                "s3:PutObject",
                "s3:PutObjectAcl",
                "s3:DeleteObject"
            ],
            "Resource": [
                "arn:aws:s3:::bucket-for-openapi-docs/*"
            ],
            "Effect": "Allow"
        }
    ]
}
````

### Examples

Using ``api2s3`` alias: 
```bash
api2s3 --src=./docs/api.yaml --s3-path="bucket-for-openapi-docs/prod/reports" --label=$(date +%s)
```

Using ``openapi-to-s3`` alias:
```bash
openapi-to-s3 --src=./docs/api.yaml --s3-path="bucket-for-openapi-docs/dev/reports" --label=latest --keep-only=1 --only-diff
```

Using docker image:
```bash
docker run -e AWS_ACCESS_KEY_ID=... -e AWS_SECRET_ACCESS_KEY=... --volume /path/to/docs:/docs --rm -it velmie/openapi-to-s3 --src=/docs/api.yml --s3Path="bucket-for-openapi-docs/dev/reports" --label=$(date +%s)  --keep-only=1 --only-diff
```

