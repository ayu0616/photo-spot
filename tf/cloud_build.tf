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
  project     = var.project_id
  trigger_template {
    branch_name = "main" # Adjust if your main branch has a different name
    repo_name   = "photo-spot" # Replace with your repository name
    project_id  = var.project_id
  }

  filename = "cloudbuild.yaml" # Cloud Build configuration file
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
