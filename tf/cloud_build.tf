# @tf/cloud_build.tf

resource "google_artifact_registry_repository" "docker_repo" {
  project       = var.project_id
  location      = var.region
  repository_id = "docker-repo"
  description   = "Docker repository for Cloud Run images"
  format        = "DOCKER"
}

# Cloud Build Trigger
resource "google_cloudbuild_trigger" "cloud_run_trigger" {
  name     = "photo-spot-trigger"
  project  = var.project_id
  location = var.region

  github {
    owner = var.github_owner # GitHub repository owner (username or organization)
    name  = var.github_repo  # GitHub repository name
    push {
      branch = "^main$" # Trigger on push to main branch
    }
  }

  build {
    step {
      name = "gcr.io/cloud-builders/docker"
      args = [
        "build",
        "-t", "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.docker_repo.repository_id}/${var.image_name}:$COMMIT_SHA",
        "-t", "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.docker_repo.repository_id}/${var.image_name}:latest",
        "--build-arg", "DATABASE_URL=${var.db_url}",
        "--build-arg", "AUTH_SECRET=${var.auth_secret}",
        "--build-arg", "AUTH_GOOGLE_ID=${var.auth_google_id}",
        "--build-arg", "AUTH_GOOGLE_SECRET=${var.auth_google_secret}",
        "--build-arg", "AUTH_URL=${var.auth_url}",
        "--build-arg", "GCS_URL=${var.gcs_url}",
        "--build-arg", "GCP_PROJECT_ID=${var.project_id}",
        "--build-arg", "GCS_BUCKET_NAME=${var.cloud_storage_bucket_name}",
        "--build-arg", "NEXT_PUBLIC_API_BASE_URL=${var.next_public_api_base_url}",
        "--build-arg", "GOOGLE_FONTS_API_KEY=${var.google_fonts_api_key}",
        "."
      ]
    }
    step {
      name = "gcr.io/cloud-builders/docker"
      args = ["push", "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.docker_repo.repository_id}/${var.image_name}:$COMMIT_SHA"]
    }
    step {
      name = "gcr.io/cloud-builders/gcloud"
      args = [
        "run", "deploy", var.service_name,
        "--image", "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.docker_repo.repository_id}/${var.image_name}:$COMMIT_SHA",
        "--region", var.region,
        "--platform", "managed",
        "--allow-unauthenticated"
      ]
      entrypoint = "gcloud"
    }
    images = ["${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.docker_repo.repository_id}/${var.image_name}:$COMMIT_SHA"]
    options {
      logging = "CLOUD_LOGGING_ONLY"
    }
  }
}

# Cloud Build Service Account permissions
resource "google_project_iam_member" "cloudbuild_cloud_run_invoker" {
  project = var.project_id
  role    = "roles/run.admin"
  member  = "serviceAccount:${data.google_project.project.number}@cloudbuild.gserviceaccount.com"
}

resource "google_project_iam_member" "cloudbuild_artifact_registry_writer" {
  project = var.project_id
  role    = "roles/artifactregistry.writer"
  member  = "serviceAccount:${data.google_project.project.number}@cloudbuild.gserviceaccount.com"
}

# Data source to get project number for Cloud Build service account
data "google_project" "project" {
  project_id = var.project_id
}
