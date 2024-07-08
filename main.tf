provider "aws" {
  region = "us-east-1"
}

data "aws_vpc" "default" {
  default = true
} 

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
   
}

resource "aws_security_group" "web_sg" {
  name        = "allow_web_traffic"
  description = "Allow web traffic"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_launch_configuration" "mern_lc" {
  name_prefix          = "mern-lc-"
  image_id             = "ami-08c23e5c67921a75c"  
  instance_type        = "t2.micro"
  security_groups      = [aws_security_group.web_sg.id]
  user_data            = file("./user-data.sh")

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_sns_topic" "sns_topic" {
  name = "notifier"
}

resource "aws_sqs_queue" "terraform_queue" {
  name                      = "terraform-queue"
  visibility_timeout_seconds= 90
  delay_seconds             = 0
  max_message_size          = 2048
  message_retention_seconds = 86400
  receive_wait_time_seconds = 5
  sqs_managed_sse_enabled   = false
 


  tags = {
    Environment = "production"
  }
}

data "aws_iam_policy_document" "sqs_policy" {
  statement {
    sid    = "__owner_statement"
    effect = "Allow"

    principals {
      type        = "AWS"
      identifiers = ["785997096043"]
    }

    actions   = ["sqs:*"]
    resources = [aws_sqs_queue.terraform_queue.arn]
  }

  statement {
    sid    = "__receiver_statement"
    effect = "Allow"

    principals {
      type        = "AWS"
      identifiers = ["arn:aws:iam::785997096043:role/pipeline"]
    }

    actions   = ["sqs:ChangeMessageVisibility","sqs:DeleteMessage","sqs:ReceiveMessage"]
    resources = [aws_sqs_queue.terraform_queue.arn]
  }
}

resource "aws_sqs_queue_policy" "test" {
  queue_url = aws_sqs_queue.terraform_queue.id
  policy    = data.aws_iam_policy_document.sqs_policy.json
}


resource "aws_sns_topic_subscription" "user_updates_sqs_target" {
  topic_arn = aws_sns_topic.sns_topic.arn
  protocol  = "sqs"
  endpoint  = aws_sqs_queue.terraform_queue.arn
}

resource "aws_autoscaling_group" "mern_asg" {
  desired_capacity     = 1
  max_size             = 3
  min_size             = 1
  vpc_zone_identifier  = data.aws_subnets.default.ids
  launch_configuration = aws_launch_configuration.mern_lc.id
  health_check_type    = "EC2"
  health_check_grace_period = 300

  tag {
    key                 = "Name"
    value               = "MERN-Stack-ASG"
    propagate_at_launch = true
  }

  target_group_arns = [aws_lb_target_group.frontend_tg.arn, aws_lb_target_group.backend_tg.arn]
}

resource "aws_lb" "mern_lb" {
  name               = "mern-lb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.web_sg.id]
  subnets            = data.aws_subnets.default.ids

  enable_deletion_protection = false
}

resource "aws_lb_target_group" "frontend_tg" {
  name     = "frontend-tg"
  port     = 80
  protocol = "HTTP"
  vpc_id   = data.aws_vpc.default.id

  health_check {
    path                = "/"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 2
    matcher             = "200-399"
  }
}

resource "aws_lb_target_group" "backend_tg" {
  name     = "backend-tg"
  port     = 3000
  protocol = "HTTP"
  vpc_id   = data.aws_vpc.default.id

  health_check {
    path                = "/"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 2
    matcher             = "200-399"
  }
}

resource "aws_lb_listener" "frontend_listener" {
  load_balancer_arn = aws_lb.mern_lb.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.frontend_tg.arn
  }
}

resource "aws_lb_listener" "backend_listener" {
  load_balancer_arn = aws_lb.mern_lb.arn
  port              = 3000
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.backend_tg.arn
  }
}


output "load_balancer_dns" {
  value = aws_lb.mern_lb.dns_name
}
