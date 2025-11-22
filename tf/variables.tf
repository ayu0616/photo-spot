# @tf/variables.tf

variable "project_id" {
  description = "The GCP project ID."
  type        = string
}

variable "region" {
  description = "The GCP region to deploy resources."
  type        = string
  default     = "asia-northeast1" # Tokyo
}

variable "service_name" {
  description = "The name of the Cloud Run service."
  type        = string
  default     = "photo-spot-app"
}

variable "image_name" {
  description = "The name of the Docker image in Container Registry."
  type        = string
  default     = "photo-spot-image"
}

variable "cloud_storage_bucket_name" {
  description = "The name of the Cloud Storage bucket for uploaded images."
  type        = string
}

variable "db_url" {
  description = "The database connection URL, including user, password, host, and database name. Example: 'mysql://user:password@unix(/cloudsql/project:region:instance-name)/dbname' or 'postgres://user:password@/cloudsql/project:region:instance-name/dbname'."
  type        = string
  sensitive   = true
}

variable "next_auth_secret" {
  description = "Secret for NextAuth.js."
  type        = string
  sensitive   = true
}

variable "gcs_url" {
  description = "The base URL for Google Cloud Storage."
  type        = string
  default     = "https://storage.googleapis.com"
}

variable "github_owner" {
  description = "The GitHub repository owner (username or organization)."
  type        = string
  default     = "ayu0616"
}

variable "github_repo" {
  description = "The GitHub repository name."
  type        = string
  default     = "photo-spot"
}
