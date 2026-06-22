#!/bin/sh
set -eu

ROOT_USER="$(cat "$MINIO_ROOT_USER_FILE")"
ROOT_PASSWORD="$(cat "$MINIO_ROOT_PASSWORD_FILE")"
APP_ACCESS_KEY="$(cat "$MINIO_ACCESS_KEY_FILE")"
APP_SECRET="$(cat "$MINIO_SECRET_KEY_FILE")"
mc alias set local http://minio:9000 "$ROOT_USER" "$ROOT_PASSWORD"
mc mb --ignore-existing "local/$MINIO_BUCKET"
mc anonymous set none "local/$MINIO_BUCKET"
mc version enable "local/$MINIO_BUCKET"
cat >/tmp/app-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::$MINIO_BUCKET",
        "arn:aws:s3:::$MINIO_BUCKET/*"
      ]
    }
  ]
}
EOF
mc admin user add local "$APP_ACCESS_KEY" "$APP_SECRET" || true
mc admin policy create local cree-app-policy /tmp/app-policy.json || true
mc admin policy attach local cree-app-policy --user "$APP_ACCESS_KEY"
