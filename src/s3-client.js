const S3 = require('aws-sdk/clients/s3');

const OUTPUT_FILE_NAME = 'openapi.yml';

class S3Client {

    constructor(bucket, path) {
        this.s3 = new S3();
        this.bucket = bucket;
        this.path = path;
    }

    getOutputFileName() {
        return OUTPUT_FILE_NAME;
    }

    async checkPermissions() {
        const acl = await this.s3.getBucketAcl({
            Bucket: this.bucket,
        }).promise();

        const permissions = acl['Grants'].map(grant => grant.Permission);

        if (permissions.includes('FULL_CONTROL') ||
            (permissions.includes('READ') && permissions.includes('WRITE'))) {
            return;
        }

        throw Error(`The client don't have read & write permissions on "${this.bucket}" bucket!`);
    }

    async getAllItems() {
        const params = {
            Bucket: this.bucket,
            Prefix: `${this.path}/`,
            MaxKeys: 2,
        };

        const data = [];

        let result;

        do {
            result = await this.s3.listObjectsV2(params).promise();

            if (result['Contents'] && result['Contents'].length > 0) {
                data.push(...result['Contents']);
            }

            if (result.IsTruncated) {
                params['ContinuationToken'] = result.NextContinuationToken;
            }
        } while (result.IsTruncated);

        data.sort(function (a, b) {
            return b['LastModified'] - a['LastModified'];
        });

        return data;
    }

    async downloadPrevious() {
        const list = await this.getAllItems();

        if (!list.length) {
            return null;
        }

        return this.s3.getObject({
            Bucket: this.bucket,
            Key: list[0]['Key'],
        }).promise();
    }

    async upload(label, data) {
        const key = `${this.path}/${label}/${OUTPUT_FILE_NAME}`;
        const params = {
            Bucket: this.bucket,
            Key: key,
            Body: data
        };

        return this.s3.upload(params).promise();
    }

    async deleteItems(items) {
        const params = {
            Bucket: this.bucket,
            Delete: {
                Objects: items.map(item => ({Key: item['Key']})),
            },
        };

        return this.s3.deleteObjects(params).promise();
    }
}

module.exports = S3Client;
