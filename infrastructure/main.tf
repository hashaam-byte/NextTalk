provider "oci" {
  region           = var.region
  tenancy_ocid     = var.tenancy_ocid
  user_ocid        = var.user_ocid
  fingerprint      = var.fingerprint
  private_key_path = var.private_key_path
}

resource "oci_core_vcn" "turn_vcn" {
  compartment_id = var.compartment_id
  cidr_block     = "10.0.0.0/16"
  display_name   = "turn-server-vcn"
}

resource "oci_core_subnet" "turn_subnet" {
  compartment_id = var.compartment_id
  vcn_id         = oci_core_vcn.turn_vcn.id
  cidr_block     = "10.0.1.0/24"
  display_name   = "turn-server-subnet"
}

resource "oci_core_instance" "turn_server" {
  compartment_id      = var.compartment_id
  availability_domain = data.oci_identity_availability_domains.ads.availability_domains[0].name
  display_name        = "turn-server"
  shape              = "VM.Standard.E4.Flex"

  source_details {
    source_type = "image"
    source_id   = var.os_image_id
  }

  create_vnic_details {
    subnet_id        = oci_core_subnet.turn_subnet.id
    assign_public_ip = true
  }

  metadata = {
    user_data = base64encode(file("./cloud-init.yaml"))
  }
}
