# ---------------------------------------------
# Terraform configuration
# ---------------------------------------------
terraform {
  # 1.6 以上: import ブロックの id に変数を使える（state 復旧時の import で利用。issue #155）
  required_version = ">=1.6"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }

  # state は共有 GCS バケットの、リポジトリ名と同じ prefix（ディレクトリ）に置く。
  # 本リポジトリは public のため、バケット名はコミットせず init 時に渡す（partial configuration）。
  # `make tf-init` が環境変数 TF_STATE_BUCKET から bucket / prefix を渡す。
  # 同じ prefix の下に terraform.tfvars も置き、`make tf-vars-pull` / `tf-vars-push` で同期する。
  backend "gcs" {}
}

# ---------------------------------------------
# Provider
# ---------------------------------------------
provider "google" {
  project = var.gcp_project_id
  region  = var.gcp_region
}
