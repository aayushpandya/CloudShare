import boto3
import os
from datetime import datetime, timedelta
import re
import base64
import json

def is_sensitive_info_detected(textract_client, file_content):
    response = textract_client.detect_document_text(Document={'Bytes': file_content})
    
    sensitive_patterns = [
        re.compile(r'\b(?:password|passwd|pass)\b', re.IGNORECASE),
        re.compile(r'\b(?:api[_-]key|api[_-]token)\b', re.IGNORECASE),
        re.compile(r'\b(?:secret|credential|access[_-]key|access[_-]token)\b', re.IGNORECASE),
        re.compile(r'\b\d{3}-\d{2}-\d{4}\b'),
        re.compile(r'\b(?:\d{4}[\s-]?){3}\d{4}\b'),
        re.compile(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'),
        re.compile(r'\b(?:\d{1,3}\.){3}\d{1,3}\b'),
    ]
    
    for item in response['Blocks']:
        if item['BlockType'] == 'WORD':
            for pattern in sensitive_patterns:
                if pattern.search(item['Text']):
                    return True
    
    return False

def lambda_handler(event, context):
    print("My lambda is invoked")
    try:

        topic_arn = os.environ.get('SNS_TOPIC_ARN')

        base64_data = event['base64_data']
        file_name = event['file_name']
        bucket_name = "secure-file-sharing-bucket"
        expiration_time_minutes = event['expires_in']
        user_id = event['user_id']
        
        file_content = base64.b64decode(base64_data)
        
        textract_client = boto3.client('textract')

        is_sensitive_info = is_sensitive_info_detected(textract_client, file_content)
        print("is_sensitive_info", is_sensitive_info)
        if is_sensitive_info:
            sns_client = boto3.client('sns')
    
            message = f"Our system has detected a sensitive file sharing attempt made by a user (User Id: {user_id}).\nIt appears that the shared file contains sensitive information that poses a potential security risk. As a precautionary measure, we have blocked the file from being shared, and the user has been notified about the policy violation.\nPlease take the necessary action to review the situation and ensure appropriate measures are taken to prevent any potential data breaches or unauthorized access."
            sns_client.publish(
                TopicArn=topic_arn,
                Message=message,
                Subject="Sensitive Information Detected"
            )
            return {
                'statusCode': 400,
                'message': 'Sensitive information detected. The file cannot be shared.'
            }
        
        s3_client = boto3.client('s3')
        timestamp = datetime.now().strftime("%Y-%m-%dT%H-%M-%S")
        expiration_time = int(expiration_time_minutes)
        expiration_time_timedelta = timedelta(minutes=expiration_time)
        expiration_timestamp = (datetime.now() + expiration_time_timedelta).strftime("%Y-%m-%dT%H-%M-%S")
        new_file_name = f"{expiration_timestamp}_{file_name}"
        s3_client.put_object(Bucket=bucket_name, Key=new_file_name, Body=file_content)
        
        pre_signed_url = s3_client.generate_presigned_url(
            'get_object',
            Params={
                'Bucket': bucket_name,
                'Key': new_file_name
            },
            ExpiresIn=60
        )
        
        # sns_client = boto3.client('sns')
        # message = f"New file shared. Here's the pre-signed URL: {pre_signed_url}"
        
        # sns_client.publish(
        #     TopicArn=topic_arn,
        #     Message=message,
        #     Subject="New File Shared"
        # )
        
        return {
            'statusCode': 200,
            'message': pre_signed_url
        }
    
    except Exception as e:
        print("Inside Catch")
        print(e)
        return {
            'statusCode': 500,
            'message': str(e)
        }
