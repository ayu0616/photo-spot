# @tf/outputs.tf

output "cloud_run_service_url" {
  description = "The URL of the deployed Cloud Run service."
  value       = google_cloud_run_v2_service.default.uri
}

output "cloud_storage_bucket_url" {
  description = "The URL of the Cloud Storage bucket."
  value       = "gs://${google_storage_bucket.image_bucket.name}"
}

output "artifact_registry_repo_url" {
  description = "The URL of the Artifact Registry Docker repository."
  value       = google_artifact_registry_repository.docker_repo.name
}
