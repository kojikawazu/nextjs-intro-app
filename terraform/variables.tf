# ---------------------------------------------
# Variables
# ---------------------------------------------
variable "project" {
  type = string
}

variable "environment" {
  type = string
}

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

variable "backend_site_url" {
  type = string
}

variable "gcs_private_bucket_name" {
  type = string
}

variable "gcs_json_path" {
  type = string
}

variable "google_application_credentials" {
  type = string
}

variable "resend_api_key" {
  type = string
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