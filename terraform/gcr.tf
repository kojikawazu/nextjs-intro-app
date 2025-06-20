# ---------------------------------------------
# Artifact Registry
# ---------------------------------------------
# Artifact Registryリポジトリの作成
resource "google_artifact_registry_repository" "nextjs_intro_ai_app_repo" {
  location      = var.gcp_region
  repository_id = var.repository_id
  description   = "Docker repository for Next.js Intro AI App"
  format        = "DOCKER"
}

# Artifact Registry API の有効化
# resource "google_project_service" "artifact_registry_api" {
#   service = "artifactregistry.googleapis.com"
#   project = var.gcp_project_id
# }
