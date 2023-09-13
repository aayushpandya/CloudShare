import boto3
from datetime import datetime

def delete_expired_files(bucket_name):
    s3_client = boto3.client('s3')
    current_time = datetime.now()
    objects_to_delete = []

    response = s3_client.list_objects_v2(Bucket=bucket_name)
    if 'Contents' in response:
        for obj in response['Contents']:
            key = obj['Key']
            expiration_time_str = key.split('_')[0]
            expiration_time = datetime.strptime(expiration_time_str, '%Y-%m-%dT%H-%M-%S')

            if current_time > expiration_time:
                objects_to_delete.append({'Key': key})

    if len(objects_to_delete) > 0:
        s3_client.delete_objects(Bucket=bucket_name, Delete={'Objects': objects_to_delete})

def lambda_handler(event, context):
    try:
        bucket_name = "secure-file-sharing-bucket"
        delete_expired_files(bucket_name)

        return {
            'statusCode': 200,
            'message': 'Expired files deleted successfully.'
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'message': str(e)
        }