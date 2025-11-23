# @tf/cloud_storage.tf

resource "google_storage_bucket" "image_bucket" {
  project                     = var.project_id
  name                        = var.cloud_storage_bucket_name
  location                    = "ASIA-NORTHEAST1" # Or any other multi-regional/regional location
  uniform_bucket_level_access = true

  # Optional: Configure lifecycle rules for objects (e.g., delete after 365 days)
  # lifecycle_rule {
  #   action {
  #     type = "Delete"
  #   }
  #   condition {
  #     age = 365
  #   }
  # }

  depends_on = [
    google_project_service.cloud_storage_api # Ensure Cloud Storage API is enabled
  ]
}

resource "google_project_service" "cloud_storage_api" {
  project            = var.project_id
  service            = "storage.googleapis.com"
  disable_on_destroy = false
}

# Grant Cloud Run service account permission to access the bucket
resource "google_storage_bucket_iam_member" "cloud_run_storage_access" {
  bucket = google_storage_bucket.image_bucket.name
  role   = "roles/storage.objectAdmin" # Read/Write access
  member = "serviceAccount:${google_service_account.cloud_run_sa.email}"
}

# Make the bucket public (readable by allUsers)
resource "google_storage_bucket_iam_member" "public_read_access" {
  bucket = google_storage_bucket.image_bucket.name
  role   = "roles/storage.objectViewer"
  member = "allUsers"
}
