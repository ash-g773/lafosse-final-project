terraform {
    required_providers {
        aws = {
            source  = "hashicorp/aws"
            version = "~> 5.0"
        }
    }
}

provider "aws" {
    region = "eu-west-2"
}

resource "aws_default_vpc" "default" {}

resource "aws_instance" "paws_server" {
    ami                    = "ami-090166bff2da03be3"
    key_name               = "default-ec2"
    instance_type          = "t4g.micro"
    vpc_security_group_ids = [aws_security_group.paws_sg.id]
    subnet_id              = data.aws_subnets.default_subnets.ids[0]

    connection {
        type        = "ssh"
        host        = self.public_ip
        user        = "ec2-user"
        private_key = file(var.aws_key_pair)
    }

    provisioner "remote-exec" {
    inline = [
        "sudo yum update -y",
        "sudo yum install -y docker git",
        "sudo systemctl start docker",
        "sudo systemctl enable docker",
        "sudo usermod -aG docker ec2-user",
        "sudo mkdir -p /usr/local/lib/docker/cli-plugins",
        "sudo curl -SL https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-linux-aarch64 -o /usr/local/lib/docker/cli-plugins/docker-compose",
        "sudo chmod +x /usr/local/lib/docker/cli-plugins/docker-compose",
        "docker compose version",
        "git clone -b docker-ec2-demo https://github.com/ash-g773/lafosse-final-project.git /home/ec2-user/app",
        "cd /home/ec2-user/app/api && echo 'SECRET_TOKEN=${var.secret_token}' >> .env && echo 'CLOUDINARY_CLOUD_NAME=${var.cloudinary_cloud_name}' >> .env && echo 'CLOUDINARY_API_KEY=${var.cloudinary_api_key}' >> .env && echo 'CLOUDINARY_API_SECRET=${var.cloudinary_api_secret}' >> .env && echo 'BCRYPT_SALT_ROUNDS=10' >> .env",
        "cd /home/ec2-user/app/api && sudo docker compose up --build -d"
    ]
}

    tags = {
        Name = "paws-api-server"
    }
}