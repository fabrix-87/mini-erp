#!/bin/sh
set -eu

bucket="${MINIO_BUCKET:-erp-product-images}"

case "$bucket" in
  *[!a-z0-9.-]*)
    echo "Invalid MINIO_BUCKET" >&2
    exit 1
    ;;
esac

docker compose exec -T minio sh -s -- "$bucket" <<'SH'
set -eu

bucket=$1
mc_config=$(mktemp -d)
trap 'rm -rf "$mc_config"' EXIT
export MC_CONFIG_DIR="$mc_config"

if ! mc alias set local http://127.0.0.1:9000 \
  "$MINIO_ROOT_USER" "$MINIO_ROOT_PASSWORD" >/dev/null 2>&1; then
  echo "Cannot connect to MinIO. Check service readiness and credentials." >&2
  exit 1
fi

mc mb --ignore-existing --region eu-central-1 "local/$bucket"

cat > "$mc_config/policy.json" <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": { "AWS": ["*"] },
      "Action": ["s3:GetObject"],
      "Resource": ["arn:aws:s3:::$bucket/*"]
    }
  ]
}
EOF

mc anonymous set-json "$mc_config/policy.json" "local/$bucket"
SH