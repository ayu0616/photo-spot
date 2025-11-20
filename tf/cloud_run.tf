# @tf/cloud_run.tf

resource "google_cloud_run_v2_service" "default" {
  project  = var.project_id
  location = var.region
  name     = var.service_name

  template {
    containers {
      image = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.docker_repo.repository_id}/${var.image_name}:latest"

      env {
        name  = "NODE_ENV"
        value = "production"
      }
      env {
        name = "GCP_PROJECT_ID"
        value = var.project_id
      }
      env {
        name = "GCS_BUCKET_NAME"
        value = var.cloud_storage_bucket_name
      }
      env {
        name = "NEXTAUTH_SECRET"
        value = var.next_auth_secret
      }
      env {
        name = "DATABASE_URL"
        value = "postgresql://${var.db_user}:${var.db_password}@/${var.db_name}?host=/cloudsql/${var.db_connection_name}"
      }
      env {
        name = "NEXT_PUBLIC_API_BASE_URL"
        value = "https://${var.service_name}-${var.region}.run.app"
      }
    }
  }

  traffic {
    type    = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
    percent = 100
  }

  depends_on = [
    google_project_service.cloud_run_api,
    google_artifact_registry_repository.docker_repo
  ]
}

# Allow unauthenticated access to the Cloud Run service
resource "google_cloud_run_service_iam_member" "default_iam_member" {
  project  = var.project_id
  location = var.region
  service  = google_cloud_run_v2_service.default.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}
