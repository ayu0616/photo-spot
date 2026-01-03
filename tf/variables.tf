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

variable "auth_secret" {
  description = "Secret for Auth.js (v5)."
  type        = string
  sensitive   = true
}

variable "auth_google_id" {
  description = "Google Client ID for Auth.js."
  type        = string
  sensitive   = true
}

variable "auth_google_secret" {
  description = "Google Client Secret for Auth.js."
  type        = string
  sensitive   = true
}

variable "auth_url" {
  description = "URL for Auth.js."
  type        = string
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

variable "next_public_api_base_url" {
  description = "The base URL for the API."
  type        = string
  default     = "http://localhost:3000"
}

variable "google_fonts_api_key" {
  description = "The API key for Google Fonts."
  type        = string
  sensitive   = true
}

variable "cors_origin" {
  description = "The origin for CORS."
  type        = string
  default     = "http://localhost:3000"
}