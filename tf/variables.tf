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

variable "db_connection_name" {
  description = "The connection name of the Cloud SQL instance (e.g., project:region:instance-name)."
  type        = string
}

variable "db_user" {
  description = "The username for the Cloud SQL database."
  type        = string
}

variable "db_password" {
  description = "The password for the Cloud SQL database user."
  type        = string
  sensitive   = true
}

variable "db_name" {
  description = "The name of the Cloud SQL database."
  type        = string
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
