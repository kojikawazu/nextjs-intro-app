# ---------------------------------------------
# Variables
# ---------------------------------------------
variable "gcp_project_id" {
  type = string
}

variable "gcp_region" {
  type = string
}

variable "repository_id" {
  type = string
}

variable "invoker_member" {
  type = string
}

variable "invoker_role" {
  type = string
}

variable "http_port" {
  type = number
}

variable "service_name" {
  type = string
}

variable "app_name" {
  type = string
}

# サイトの公開 URL。Cloud Run には SITE_URL として注入する。
# NEXT_PUBLIC_ を付けるとビルド時に焼き込まれ実行時注入が効かないため、接頭辞は付けない。
variable "site_url" {
  type = string
}

variable "gcs_private_bucket_name" {
  type = string
}

variable "gcs_json_path" {
  type = string
}

# plan / apply の出力に値を出さない（Cloud Run の env として state には平文で入る点は変わらない）
variable "resend_api_key" {
  type      = string
  sensitive = true
}

variable "resend_from_email" {
  type = string
}

variable "my_mail_address" {
  type = string
}

variable "node_env" {
  type = string
}

variable "next_telemetry_disabled" {
  type = string
}