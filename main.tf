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

output "sqs_queue_url" {
  value = aws_sqs_queue.terraform_queue.id
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

  #  statement {
  #   sid    = "__sns_statement"
  #   effect = "Allow"

  #   principals {
  #     type        = "AWS"
  #     identifiers = ["*"]
  #   }

  #   actions   = ["sqs:SendMessage"]
  #   resources = [aws_sqs_queue.terraform_queue.arn]
  #   condition {
  #     test     = "ArnLike"
  #     variable = "aws:SourceArn"
  #     values   = [aws_sns_topic.sns_topic.arn]
  #   }
  # }
}

resource "aws_sqs_queue_policy" "test" {
  queue_url = aws_sqs_queue.terraform_queue.id
  policy    = data.aws_iam_policy_document.sqs_policy.json
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

  ingress {
    from_port   = 22
    to_port     = 22
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
  key_name             = "dh-local"


  lifecycle {
    create_before_destroy = true
  }
}

# resource "aws_sns_topic" "sns_topic" {
#   name = "notifier"
# }




# resource "aws_sns_topic_subscription" "user_updates_sqs_target" {
#   topic_arn = aws_sns_topic.sns_topic.arn
#   protocol  = "sqs"
#   endpoint  = aws_sqs_queue.terraform_queue.arn
# }

resource "aws_autoscaling_group" "mern_asg" {
  name                 = "asg"
  desired_capacity     = 1
  max_size             = 3
  min_size             = 1
  vpc_zone_identifier  = data.aws_subnets.default.ids
  launch_configuration = aws_launch_configuration.mern_lc.id
  health_check_type    = "ELB"
  health_check_grace_period = 3000
  depends_on = [aws_sqs_queue.terraform_queue]

  tag {
    key                 = "Name"
    value               = "MERN-Stack-ASG"
    propagate_at_launch = true
  }

   initial_lifecycle_hook {
    name                   = "hook"
    # autoscaling_group_name = aws_autoscaling_group.mern_asg.name
    default_result         = "CONTINUE"
    heartbeat_timeout      = 2000
    lifecycle_transition   = "autoscaling:EC2_INSTANCE_LAUNCHING"


    notification_target_arn = aws_sqs_queue.terraform_queue.arn
    role_arn                = "arn:aws:iam::785997096043:role/lifecycle-hook-access"
  }


  target_group_arns = [aws_lb_target_group.frontend_tg.arn, aws_lb_target_group.backend_tg.arn]
}

# resource "aws_autoscaling_lifecycle_hook" "hook" {
#   name                   = "hook"
#   autoscaling_group_name = aws_autoscaling_group.mern_asg.name
#   default_result         = "CONTINUE"
#   heartbeat_timeout      = 2000
#   lifecycle_transition   = "autoscaling:EC2_INSTANCE_LAUNCHING"


#   notification_target_arn = aws_sqs_queue.terraform_queue.arn
#   role_arn                = "arn:aws:iam::785997096043:role/lifecycle-hook-access"
# }

# resource "aws_autoscaling_notification" "example_notifications" {
#   group_names = [
  
#     aws_autoscaling_group.mern_asg.name,
#   ]

#   notifications = [
#     "autoscaling:EC2_INSTANCE_LAUNCH",
#     # "autoscaling:EC2_INSTANCE_TERMINATE",
#     # "autoscaling:EC2_INSTANCE_LAUNCH_ERROR",
#     # "autoscaling:EC2_INSTANCE_TERMINATE_ERROR",
#   ]

#   topic_arn = aws_sns_topic.sns_topic.arn
# }

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
  deregistration_delay = 30

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
    path                = "/hello"
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

resource "aws_wafv2_ip_set" "blocked_ip_set" {
  name               = "blocked-ip-set"
  scope              = "REGIONAL"
  ip_address_version = "IPV4"
  addresses          = ["174.88.68.71/32"]
  description        = "IP set to block specific IP addresses"

  tags = {
    Name = "Blocked IP Set"
  }
}

resource "aws_wafv2_web_acl" "my_web_acl" {
  name        = "my-web-acl"
  scope       = "REGIONAL"
  description = "Web ACL to block specific IP addresses"

  default_action {
    allow {}
  }

  rule {
    name     = "BlockSpecificIP"
    priority = 1

    action {
      block {}
    }

    statement {
      ip_set_reference_statement {
        arn = aws_wafv2_ip_set.blocked_ip_set.arn
      }
    }

    visibility_config {
      sampled_requests_enabled  = true
      cloudwatch_metrics_enabled = true
      metric_name                = "block-specific-ip"
    }
  }

  visibility_config {
    sampled_requests_enabled  = true
    cloudwatch_metrics_enabled = true
    metric_name                = "my-web-acl"
  }

  tags = {
    Name = "My Web ACL"
  }
}

resource "aws_wafv2_web_acl_association" "lb_association" {
  resource_arn = aws_lb.mern_lb.arn
  web_acl_arn  = aws_wafv2_web_acl.my_web_acl.arn
}
