output "ec2_public_ip" {
    value = aws_instance.paws_server.public_ip
}

output "api_url" {
    value = "http://${aws_instance.paws_server.public_ip}:3000"
}